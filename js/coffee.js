(function () {
  "use strict";

  var tableRoot, visibleCountEl;
  var rows = []; // <tr> elements, once rendered

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    wireThemeToggle();

    tableRoot = document.getElementById("coffee-table-root");
    visibleCountEl = document.getElementById("visibleCount");
    if (!tableRoot || !window.COFFEE_WORKER_URL) return;

    fetch(window.COFFEE_WORKER_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Bad response: " + res.status);
        return res.json();
      })
      .then(function (beans) {
        renderTable(Array.isArray(beans) ? beans : []);
      })
      .catch(function () {
        tableRoot.innerHTML =
          '<p class="coffee-status coffee-status-error">Couldn\'t load the coffee list right now. Try refreshing in a bit.</p>';
      });
  }

  function wireThemeToggle() {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;
    var root = document.documentElement;
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effectiveIsDark = current ? current === "dark" : prefersDark;
      root.setAttribute("data-theme", effectiveIsDark ? "light" : "dark");
    });
  }

  /* ---------------- Table ---------------- */

  function renderTable(beans) {
    if (beans.length === 0) {
      tableRoot.innerHTML = '<p class="coffee-status">No coffee beans found.</p>';
      return;
    }

    var html = '<div class="table-wrap"><table id="ledgerTable"><thead><tr>';
    html += "<th></th>";
    html += "<th>Name</th>";
    html += "<th>Company</th>";
    html += "<th>Origin</th>";
    html += '<th><div class="th-inner"><span>Roast</span><button type="button" class="th-filter-btn" id="roastFilterBtn" aria-label="Filter roast">&#9662;</button></div></th>';
    html += "<th>Process</th>";
    html += "<th>Varietal</th>";
    html += "<th>Notes</th>";
    html += '<th class="num">&#8377;/250g</th>';
    html += '<th><span class="th-sort" id="sortByDate" data-dir="desc">Purchased<span id="sortArrow"> &#8595;</span></span></th>';
    html += "</tr></thead><tbody id=\"ledgerBody\">";

    beans.forEach(function (bean, i) {
      html += renderRow(bean, i);
    });

    html += "</tbody></table></div>";
    tableRoot.innerHTML = html;

    rows = Array.prototype.slice.call(tableRoot.querySelectorAll("tr.data-row"));
    updateCount();
    wireRowExpansion();
    wireColumnFilter("roast", document.getElementById("roastFilterBtn"));
    wireSort();
  }

  function renderRow(bean, index) {
    var photoAttr = bean.photoUrl ? ' data-photo="' + escapeHtml(bean.photoUrl) + '"' : "";
    var html =
      '<tr class="data-row" data-key="' +
      escapeHtml(bean.id || "row" + index) +
      '" data-name="' +
      escapeHtml(bean.name) +
      '" data-roast="' +
      escapeHtml(bean.roast || "") +
      '" data-date="' +
      escapeHtml(bean.purchaseDate || "") +
      '"' +
      photoAttr +
      ">";
    html += '<td><span class="expand-arrow">&#9656;</span></td>';
    html += "<td>" + escapeHtml(bean.name) + "</td>";
    html += "<td>" + cell(bean.company) + "</td>";
    html += "<td>" + cell(bean.origin) + "</td>";
    html += "<td>" + cell(bean.roast) + "</td>";
    html += "<td>" + cell(bean.process) + "</td>";
    html += "<td>" + cell(bean.varietal) + "</td>";
    html += "<td>" + notesCell(bean.flavorNotes) + "</td>";
    html += '<td class="num">' + priceCell(bean.pricePer250g) + "</td>";
    html += "<td>" + cell(bean.purchaseDate) + "</td>";
    html += "</tr>";
    return html;
  }

  function updateCount() {
    if (!visibleCountEl) return;
    var visible = rows.filter(function (r) { return !r.classList.contains("row-hidden"); }).length;
    visibleCountEl.textContent = visible + " / " + rows.length + " entries";
  }

  /* ---------------- Row expand (photo) ---------------- */

  function collapseAllDetails() {
    Array.prototype.slice.call(tableRoot.querySelectorAll(".detail-row")).forEach(function (d) {
      d.remove();
    });
    rows.forEach(function (r) {
      var arrow = r.querySelector(".expand-arrow");
      if (arrow) arrow.textContent = "▸";
    });
  }

  // Sync script (scripts/sync-coffee-images.js) mirrors bean photos into
  // img/coffee/beans/{notion-page-id}.{ext}. Try those extensions first —
  // fast, static, never expires — before falling back to the live
  // (temporary) Notion URL the worker returned for this bean.
  var LOCAL_PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"];

  function buildPhotoElement(id, liveUrl, altText) {
    var img = document.createElement("img");
    img.alt = altText;
    var extIndex = 0;

    function tryNext() {
      if (extIndex < LOCAL_PHOTO_EXTENSIONS.length) {
        img.src = "/img/coffee/beans/" + id + "." + LOCAL_PHOTO_EXTENSIONS[extIndex];
        extIndex++;
      } else if (liveUrl) {
        img.removeEventListener("error", tryNext);
        img.src = liveUrl;
      } else {
        img.removeEventListener("error", tryNext);
        img.replaceWith(emptyPhotoNote());
      }
    }

    img.addEventListener("error", tryNext);
    tryNext();
    return img;
  }

  function emptyPhotoNote() {
    var span = document.createElement("span");
    span.className = "detail-empty";
    span.textContent = "No photo attached to this entry.";
    return span;
  }

  function wireRowExpansion() {
    rows.forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest("a, button")) return;

        var existing = row.nextElementSibling;
        if (existing && existing.classList.contains("detail-row") && existing.dataset.owner === row.dataset.key) {
          existing.remove();
          row.querySelector(".expand-arrow").textContent = "▸";
          return;
        }

        collapseAllDetails();

        var id = row.dataset.key;
        var liveUrl = row.getAttribute("data-photo");
        var name = row.getAttribute("data-name");
        var detail = document.createElement("tr");
        detail.className = "detail-row";
        detail.dataset.owner = id;
        var td = document.createElement("td");
        td.colSpan = 10;
        var panel = document.createElement("div");
        panel.className = "detail-panel";
        panel.appendChild(buildPhotoElement(id, liveUrl, name));
        td.appendChild(panel);
        detail.appendChild(td);
        row.parentNode.insertBefore(detail, row.nextSibling);
        row.querySelector(".expand-arrow").textContent = "▾";
      });
    });
  }

  /* ---------------- Roast filter ---------------- */

  var activeFilters = {};

  function applyFilters() {
    rows.forEach(function (r) {
      var matches = Object.keys(activeFilters).every(function (k) {
        return r.getAttribute("data-" + k) === activeFilters[k];
      });
      r.classList.toggle("row-hidden", !matches);
    });
    updateCount();
    collapseAllDetails();
  }

  function wireColumnFilter(key, btn) {
    if (!btn) return;
    var th = btn.closest("th");

    function closePopover() {
      var existing = th.querySelector(".popover");
      if (existing) existing.parentNode.removeChild(existing);
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (th.querySelector(".popover")) {
        closePopover();
        return;
      }

      var values = [];
      rows.forEach(function (r) {
        var v = r.getAttribute("data-" + key);
        if (v && values.indexOf(v) === -1) values.push(v);
      });
      values.sort();

      var pop = document.createElement("div");
      pop.className = "popover";
      var html = "";
      values.forEach(function (v) {
        html +=
          '<button type="button" data-value="' +
          escapeHtml(v) +
          '">' +
          escapeHtml(v) +
          (activeFilters[key] === v ? " &#10003;" : "") +
          "</button>";
      });
      html += '<button type="button" class="clear">Clear filter</button>';
      pop.innerHTML = html;
      th.appendChild(pop);

      pop.querySelectorAll("button[data-value]").forEach(function (b) {
        b.addEventListener("click", function () {
          activeFilters[key] = b.getAttribute("data-value");
          btn.classList.add("active");
          applyFilters();
          closePopover();
        });
      });
      pop.querySelector(".clear").addEventListener("click", function () {
        delete activeFilters[key];
        btn.classList.remove("active");
        applyFilters();
        closePopover();
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".popover") && !e.target.closest(".th-filter-btn")) closePopover();
    });
  }

  /* ---------------- Sort ---------------- */

  function wireSort() {
    var sortEl = document.getElementById("sortByDate");
    var sortArrow = document.getElementById("sortArrow");
    var tbody = document.getElementById("ledgerBody");
    if (!sortEl) return;

    sortEl.addEventListener("click", function () {
      collapseAllDetails();
      var dir = sortEl.getAttribute("data-dir") === "asc" ? "desc" : "asc";
      sortEl.setAttribute("data-dir", dir);
      sortArrow.textContent = dir === "asc" ? " ↑" : " ↓";

      var sorted = rows.slice().sort(function (a, b) {
        var av = a.getAttribute("data-date") || "";
        var bv = b.getAttribute("data-date") || "";
        if (!av && !bv) return 0;
        if (!av) return 1;
        if (!bv) return -1;
        var cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return dir === "asc" ? cmp : -cmp;
      });
      sorted.forEach(function (r) { tbody.appendChild(r); });
    });
  }

  /* ---------------- Cell helpers ---------------- */

  function cell(value) {
    return value === null || value === undefined || value === "" ? '<span class="empty-cell">&mdash;</span>' : escapeHtml(String(value));
  }

  function priceCell(value) {
    return value === null || value === undefined ? '<span class="empty-cell">&mdash;</span>' : "&#8377;" + escapeHtml(String(value));
  }

  function notesCell(tags) {
    if (!tags || tags.length === 0) return '<span class="empty-cell">&mdash;</span>';
    return "[" + tags.map(escapeHtml).join(", ") + "]";
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
