(function () {
  "use strict";

  var tableRoot, visibleCountEl;
  var rows = []; // <tr> elements, once rendered
  var allBeans = [];
  var currentView = "table"; // kept in sync with #ledgerSection's data-view (CSS decides the actual default)

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    wireThemeToggle();
    wireViewToggle();

    tableRoot = document.getElementById("coffee-table-root");
    visibleCountEl = document.getElementById("visibleCount");
    if (!tableRoot || !window.COFFEE_WORKER_URL) return;

    fetch(window.COFFEE_WORKER_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Bad response: " + res.status);
        return res.json();
      })
      .then(function (beans) {
        allBeans = Array.isArray(beans) ? beans : [];
        renderTable(allBeans);
        if (currentView === "cards") {
          renderCards(allBeans);
          if (visibleCountEl) visibleCountEl.textContent = allBeans.length + " entries";
        }
      })
      .catch(function () {
        var msg =
          '<p class="coffee-status coffee-status-error">Couldn\'t load the coffee list right now. Try refreshing in a bit.</p>';
        tableRoot.innerHTML = msg;
        var cardsRoot = document.getElementById("coffee-cards-root");
        if (cardsRoot) cardsRoot.innerHTML = msg;
      });
  }

  /* ---------------- View toggle ---------------- */

  var TABLE_HINT = 'Click a row for its photo. Click “Roast ▾” to filter, click “Purchased” to sort.';
  var CARD_HINT = "A quick-glance gallery of every bag tried.";

  function wireViewToggle() {
    var tableBtn = document.getElementById("viewToggleTable");
    var cardsBtn = document.getElementById("viewToggleCards");
    var ledgerSection = document.getElementById("ledgerSection");
    var hint = document.getElementById("ledgerHint");
    if (!tableBtn || !cardsBtn || !ledgerSection) return;

    function setView(view) {
      var isCards = view === "cards";
      currentView = view;
      ledgerSection.setAttribute("data-view", view);
      tableBtn.classList.toggle("is-active", !isCards);
      cardsBtn.classList.toggle("is-active", isCards);
      if (hint) hint.textContent = isCards ? CARD_HINT : TABLE_HINT;
      if (!allBeans.length) return;
      if (isCards) {
        renderCards(allBeans);
        if (visibleCountEl) visibleCountEl.textContent = allBeans.length + " entries";
      } else {
        updateCount();
      }
    }

    tableBtn.addEventListener("click", function () { setView("table"); });
    cardsBtn.addEventListener("click", function () { setView("cards"); });

    // Table needs 900px of breathing room and a sideways scroll on a phone; the CSS
    // default already renders cards below the breakpoint, this just keeps the toggle
    // pill and hint text in sync with what's actually on screen.
    if (window.matchMedia("(max-width: 640px)").matches) setView("cards");
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

  function wirePhotoFallback(img, id, liveUrl, onExhausted) {
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
        onExhausted();
      }
    }

    img.addEventListener("error", tryNext);
    tryNext();
  }

  function buildPhotoElement(id, liveUrl, altText) {
    var img = document.createElement("img");
    img.alt = altText;
    wirePhotoFallback(img, id, liveUrl, function () {
      img.replaceWith(emptyPhotoNote());
    });
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
        td.colSpan = 9;
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

  /* ---------------- Card view ---------------- */

  var PIN_ICON =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-7.58 7-12A7 7 0 0 0 5 10c0 4.42 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var PLANT_ICON =
    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22V13"/><path d="M12 13c0-4 3-6 7-6 0 4-3 7-7 6z"/><path d="M12 13c0-3-2.5-5-6-5 0 3.5 2.5 6 6 5z"/></svg>';

  var ROAST_LEVEL = { "Light": 1, "Light-Medium": 2, "Medium": 3, "Medium-Dark": 4, "Dark": 5 };

  function renderCards(beans) {
    var root = document.getElementById("coffee-cards-root");
    if (!root) return;
    if (beans.length === 0) {
      root.innerHTML = '<p class="coffee-status">No coffee beans found.</p>';
      return;
    }

    root.innerHTML = '<div class="card-grid">' + beans.map(cardHTML).join("") + "</div>";
  }

  function cardHTML(bean) {
    var hasLoc = !!bean.origin;
    var hasVar = !!bean.varietal;
    var metaParts = [];
    if (hasLoc) metaParts.push('<span class="bean-card-meta-item">' + PIN_ICON + "<span>" + escapeHtml(bean.origin) + "</span></span>");
    if (hasLoc && hasVar) metaParts.push('<span class="bean-card-sep"></span>');
    if (hasVar) metaParts.push('<span class="bean-card-meta-item">' + PLANT_ICON + "<span>" + escapeHtml(bean.varietal) + "</span></span>");

    var notesLine =
      bean.flavorNotes && bean.flavorNotes.length
        ? '<div class="bean-card-notes">' + escapeHtml(bean.flavorNotes.join(" · ")) + "</div>"
        : "";

    return (
      '<div class="bean-card">' +
        '<div class="bean-card-top">' +
          '<div class="bean-card-heading">' +
            '<div class="bean-card-name">' + escapeHtml(bean.name) + "</div>" +
            (bean.company ? '<div class="bean-card-company">' + escapeHtml(bean.company) + "</div>" : "") +
          "</div>" +
          '<div class="bean-card-roast">' + roastIndicator(bean.roast) + "</div>" +
        "</div>" +
        (metaParts.length ? '<div class="bean-card-meta">' + metaParts.join("") + "</div>" : "") +
        notesLine +
        '<div class="bean-card-footer"><span>' + cell(bean.process) + "</span><span>" + cardFooterRight(bean) + "</span></div>" +
      "</div>"
    );
  }

  function roastIndicator(roast) {
    if (!roast) return '<span class="bean-card-omni">Unrated</span>';
    var level = ROAST_LEVEL[roast];
    if (!level) return '<span class="bean-card-omni">' + escapeHtml(roast) + "</span>";
    var dots = "";
    for (var i = 0; i < 5; i++) dots += beanDot(i < level);
    return '<div class="bean-card-beans" title="' + escapeHtml(roast) + " roast (" + level + '/5)">' + dots + "</div>";
  }

  function beanDot(filled) {
    var fill = filled ? "var(--muted)" : "none";
    var strokeOpacity = filled ? 1 : 0.35;
    var creaseColor = filled ? "var(--bg-highlight)" : "var(--muted)";
    var creaseOpacity = filled ? 0.6 : 0.3;
    return (
      '<svg width="8" height="11" viewBox="0 0 9 12" aria-hidden="true">' +
        '<path d="M4.5.6C2 .6.6 3 .6 6s1.4 5.4 3.9 5.4S8.4 9 8.4 6 7 .6 4.5.6z" fill="' + fill +
          '" stroke="var(--muted)" stroke-opacity="' + strokeOpacity + '" stroke-width="1"/>' +
        '<path d="M4.5 1.4v9.2" stroke="' + creaseColor + '" stroke-opacity="' + creaseOpacity + '" stroke-width=".8" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function cardFooterRight(bean) {
    if (!bean.purchaseDate) return '<span class="empty-cell">&mdash;</span>';
    return escapeHtml(dateLabel(bean.purchaseDate));
  }

  function dateLabel(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /* ---------------- Cell helpers ---------------- */

  function cell(value) {
    return value === null || value === undefined || value === "" ? '<span class="empty-cell">&mdash;</span>' : escapeHtml(String(value));
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
