(function () {
  "use strict";

  // Maps a ledger row's Notion page id to its AI-rendered pouch photo in
  // img/coffee/3d/. Built from img/coffee/3d/mapping.md -- only ~51 of the
  // 86 ledger rows have a matching render, the rest are intentionally absent.
  var POUCH_IMAGES = {
    "180f2382-6e38-800e-8e8b-c3b6bca68f4e": "satchmo+bloom-coffee-roasters-2.webp",
    "1a4f2382-6e38-809c-b2d2-ebd7a60b875b": "ijen-lestari-java+gb-roasters.webp",
    "1a4f2382-6e38-80e5-a62c-f7b527e3dcfc": "el-burro-gesha+gb-roasters.webp",
    "180f2382-6e38-8016-bdbc-cb4c9005e2df": "project-pearl-ratnagiri-estate+subko.webp",
    "302f2382-6e38-80d3-adb6-fcaaebe6e763": "project-pearl-ratnagiri-estate+subko-2.webp",
    "2a0f2382-6e38-8009-987f-fd21419d609f": "yemen-ahmed-bin-ahmed-naturals+coffee-libre.webp",
    "2a0f2382-6e38-8062-893f-f93c6d21bcbb": "honduras-coe-4th-place-goldmund-collection+coffee-libre.webp",
    "2cff2382-6e38-805c-9987-e1dbaf6e74ef": "ekata-estate-best-of-gundikhan+gb-roastery.webp",
    "18ff2382-6e38-80ef-abb9-f0dd830209ae": "wubanchi-yirgacheffe+gb-roasters.webp",
    "25ef2382-6e38-803c-a79d-dc11ef378bf5": "yung-gun+subko.webp",
    "180f2382-6e38-80a8-8863-c887e2f4e011": "project-sankalp-garo-hills+subko.webp",
    "180f2382-6e38-80ac-9298-dd144af18e77": "vienna-roast+blue-tokai.webp",
    "180f2382-6e38-80b1-afc4-dfee5aa4dbf6": "ethiopia-gedeb-metad-natural+blue-bottle-coffee.webp",
    "180f2382-6e38-80b7-8a12-c9014617c0ab": "red-honey+roast-the-caffeine-capital.webp",
    "180f2382-6e38-80b9-93d5-c8f7d21f6164": "s-orange+bacha-coffee.webp",
    "25ef2382-6e38-8093-a0c7-c81d17bb0942": "arabica-blend+arabica.webp",
    "180f2382-6e38-80be-a67c-c6755f1ee030": "sumatra-mandheling+gb-roasters.webp",
    "180f2382-6e38-80bf-b0a9-c95f5ef5c34a": "columbia-huila-monteblanco+arabica.webp",
    "180f2382-6e38-80c0-9d6d-ead840703e33": "thogarihunkal-estate+blue-tokai.webp",
    "180f2382-6e38-80c2-ba47-e7313bf1c9c3": "nosy-lucy+veronicas.webp",
    "180f2382-6e38-80c3-9118-d325de4880dc": "hosabane-estate+blue-tokai.webp",
    "180f2382-6e38-80db-b293-cd79b106a9c4": "salawara-blend+ground-up.webp",
    "180f2382-6e38-80e5-b6d2-c29ba98917c5": "hidden-falls+7-to-9-grams.webp",
    "180f2382-6e38-80e7-b80b-e633e92303a1": "kolli-berri-estate+blue-tokai.webp",
    "180f2382-6e38-80ef-9466-e14e760dab56": "gundikhan-estate+blue-tokai.webp",
    "180f2382-6e38-800e-9adf-e707b1bab30d": "pearl-mountain+earth-roastery.webp",
    "180f2382-6e38-801e-afcd-e8eeccc835ef": "red-honey+kc-roasters.webp",
    "180f2382-6e38-804d-8c6f-e04ef2de794f": "the-rose-coffee+greysoul.webp",
    "180f2382-6e38-805f-98f0-cf2bb5d577ef": "blue-danube+bacha-coffee.webp",
    "180f2382-6e38-807c-a5d2-c7459cf6e12c": "columbia-geisha+gb-roasters.webp",
    "180f2382-6e38-807f-af03-e866dd15348f": "m-s-estate+blue-tokai.webp",
    "180f2382-6e38-808d-bec4-dc841a7410c1": "thogarihunkal-estate-hsd+blue-tokai.webp",
    "180f2382-6e38-809f-8d9a-fcd54655e352": "mango-punch+fraction9.webp",
    "291f2382-6e38-8030-b8d3-f8c541c82f06": "chiang-mai-doi-inthanon-peacerry-farm+sarnies.webp",
    "180f2382-6e38-8006-98d9-d750901f2177": "monsoon-malabar-aa+naivo.webp",
    "180f2382-6e38-8025-ba0b-c5bd83ec9c2e": "salawara-estate-espresso-blend+beanlore.webp",
    "180f2382-6e38-8030-87ac-df9563dedf46": "koji-fermented-naturals+subko.webp",
    "180f2382-6e38-8037-b672-d74d1aadb588": "starbucks-reserve-tokyo+starbucks.webp",
    "180f2382-6e38-8040-b159-cf16335ee6af": "1910+bacha-coffee.webp",
    "180f2382-6e38-8045-82be-f07196710614": "high-octane-coffee+grind-bar.webp",
    "180f2382-6e38-8046-9ddb-fd1311765841": "seethargundu-estate+blue-tokai.webp",
    "180f2382-6e38-8049-b8a6-f199140c1247": "howdia-estate+blue-tokai.webp",
    "180f2382-6e38-8051-bd73-c2b1d2028aa4": "kwatz.webp",
    "180f2382-6e38-8069-9bad-c28cb6d63119": "coffee-rooster+coffee-rooster.webp",
    "180f2382-6e38-8074-9e24-f19d5fda0dd0": "cima-yeast-fermented-natural-baarbara-estate+blue-tokai.webp",
    "201f2382-6e38-80ab-9328-cd0f252e08bf": "baarbara-estate+gb-roasters.webp",
    "201f2382-6e38-80ea-84f7-e1d1124b98d7": "mudremane-estate+gb-roasters.webp",
    "234f2382-6e38-8046-8288-ce5120967f6f": "zebra-blend+zebra.webp",
    "245f2382-6e38-8062-ba6f-e2bfb21c4ac1": "odisha-fermented-naturals+greysoul.webp",
    "291f2382-6e38-80bc-96a4-e8c06b36fcd3": "brazil-sitio-passaredo-red-catuai+cobbled-roastery-edinburgh.webp",
    "180f2382-6e38-8086-afd9-cd1c8057458c": "nicaragua-jinotega-las-delicias+arabica.webp",
    "180f2382-6e38-8058-9844-fbb65204c62b": "gundikhan-estate+curious-life.webp",
    "180f2382-6e38-803a-863a-c40a1560592f": "zunheboto-naturals+greysoul-roasters.webp",
    "1e4f2382-6e38-8034-b9b5-edd01144dc0c": "ratnagiri-estate-alchemy+subko.webp",
    "1e4f2382-6e38-80ac-a8ec-da84290a8061": "ethiopia-hamasho-village+gb-roasters.webp",
    "302f2382-6e38-8097-9a36-daa8330d7157": "macinato-fresh+kimbo.webp",
    "3a9f2382-6e38-817e-93d5-e1f21c5a8cdb": "haven+beanrove.webp",
    "302f2382-6e38-8061-8c93-c3a2f54fe404": "honduras-by-rush+rush-coffee-roasters.webp",
    "302f2382-6e38-80e9-9970-ca42d8d188f1": "flower-ferry+korero.webp",
    "302f2382-6e38-80f6-a634-ec45d7a7434e": "anthology+korero-coffee-roasters.webp",
    "302f2382-6e38-8063-a995-f0b7c4992f79": "gravity+korero.webp",
    "180f2382-6e38-80a8-bab1-d266cd12c311": "rohan-bopannas-masterblend+mavericks-and-farmers.webp",
    "180f2382-6e38-801a-b454-f369c7610701": "tall-dark-handsome+mavericks-and-farmers.webp",
    "180f2382-6e38-80e5-8d38-c369c83e48a5": "selection+araku.webp",
    "180f2382-6e38-800a-b864-cde1ac035045": "signature+araku.webp",
    "3bff2382-6e38-8175-a803-cfa688ccc508": "honduras-las-virginias-lot-278+stellar-coffee.webp",
    "3bff2382-6e38-812f-9e71-c2b5dc547a27": "atok-benguet+commune.webp",
    "3bff2382-6e38-81de-b8aa-e0106aadbebb": "depth+beanrove.webp",
    "3bff2382-6e38-81e1-bb87-c4001499df1d": "peaberry-atok-benguet+commune.webp"
  };

  function pouchImage(id) {
    var file = POUCH_IMAGES[id];
    return file ? "/img/coffee/3d/" + file : null;
  }

  var tableRoot, visibleCountEl;
  var rows = []; // <tr> elements, once rendered
  var allBeans = [];
  var beanById = {};
  var currentView = "cards"; // kept in sync with #ledgerSection's data-view (CSS decides the actual default: cards, everywhere)
  var beanDetail, beanDetailInner, beanBody;
  var lastFocusedBean = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    wireThemeToggle();
    wireViewToggle();
    wireBeanDetailClose();

    tableRoot = document.getElementById("coffee-table-root");
    visibleCountEl = document.getElementById("visibleCount");
    beanDetail = document.getElementById("beanDetail");
    beanDetailInner = document.getElementById("beanDetailInner");
    beanBody = document.body;
    if (!tableRoot || !window.COFFEE_WORKER_URL) return;

    fetch(window.COFFEE_WORKER_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Bad response: " + res.status);
        return res.json();
      })
      .then(function (beans) {
        allBeans = Array.isArray(beans) ? beans : [];
        beanById = {};
        allBeans.forEach(function (b) { if (b.id) beanById[b.id] = b; });
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

  function wireViewToggle() {
    var tableBtn = document.getElementById("viewToggleTable");
    var cardsBtn = document.getElementById("viewToggleCards");
    var ledgerSection = document.getElementById("ledgerSection");
    if (!tableBtn || !cardsBtn || !ledgerSection) return;

    function setView(view) {
      var isCards = view === "cards";
      currentView = view;
      ledgerSection.setAttribute("data-view", view);
      tableBtn.classList.toggle("is-active", !isCards);
      cardsBtn.classList.toggle("is-active", isCards);
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

        var bean = beanById[row.dataset.key];
        if (bean && pouchImage(bean.id)) {
          openBeanDetail(bean, null);
          return;
        }

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

  /* ---------------- Bean detail takeover (pouch photo) ---------------- */

  function beanMetaHTML(bean) {
    var fields = [
      ["Roaster", bean.company],
      ["Process", bean.process],
      ["Varietal", bean.varietal],
      ["Location", bean.origin],
      ["Price", bean.pricePer250g ? "Rs. " + bean.pricePer250g + " / 250g" : null],
      ["Purchased on", bean.purchaseDate ? dateLabel(bean.purchaseDate) : null],
      ["Notes", bean.flavorNotes && bean.flavorNotes.length ? bean.flavorNotes.join(", ") : null]
    ];

    var rows = fields
      .filter(function (f) { return !!f[1]; })
      .map(function (f) {
        return '<div class="bean-detail-field"><span class="bean-detail-field-label">' + escapeHtml(f[0]) +
          '</span><span class="bean-detail-field-value">' + escapeHtml(f[1]) + "</span></div>";
      })
      .join("");

    // Roast has no text row -- the bean-dot design (same as the card view) stands in for it.
    if (bean.roast) {
      rows += '<div class="bean-detail-field"><span class="bean-detail-field-label">Roast</span>' +
        '<span class="bean-detail-field-value">' + roastIndicator(bean.roast) + "</span></div>";
    }

    return "<h1>" + escapeHtml(bean.name) + "</h1>" + '<div class="bean-detail-fields">' + rows + "</div>";
  }

  function openBeanDetail(bean, triggerEl) {
    if (!beanDetail || !beanDetailInner) return;
    var photo = pouchImage(bean.id);
    if (!photo) return;

    lastFocusedBean = triggerEl || null;

    beanDetailInner.innerHTML =
      '<div class="bean-detail-image"><img src="' + photo + '" alt="' + escapeHtml(bean.name) + '"></div>' +
      '<div class="bean-detail-meta">' + beanMetaHTML(bean) + "</div>";

    beanDetail.setAttribute("aria-hidden", "false");

    var imageWrap = beanDetailInner.querySelector(".bean-detail-image");
    var metaWrap = beanDetailInner.querySelector(".bean-detail-meta");
    var thumb = triggerEl ? triggerEl.querySelector(".bean-card-photo") : null;
    var startRect = thumb ? thumb.getBoundingClientRect() : null;

    // Same FLIP treatment as the equipment detail takeover: pin the image to
    // where the clicked card's thumbnail sits on screen, then release the pin
    // so it grows/moves into its full-size laid-out position.
    requestAnimationFrame(function () {
      if (imageWrap) {
        imageWrap.style.transition = "none";
        if (startRect) {
          var endRect = imageWrap.getBoundingClientRect();
          var scale = endRect.width ? startRect.width / endRect.width : 0.78;
          var dx = (startRect.left + startRect.width / 2) - (endRect.left + endRect.width / 2);
          var dy = (startRect.top + startRect.height / 2) - (endRect.top + endRect.height / 2);
          imageWrap.style.transform = "translate(" + dx + "px, " + dy + "px) scale(" + scale + ")";
        }
      }
      if (metaWrap) metaWrap.style.transition = "none";

      requestAnimationFrame(function () {
        beanBody.classList.add("bean-open");
        beanDetail.classList.add("is-open");
        if (imageWrap) {
          imageWrap.style.transition = "";
          imageWrap.style.transform = "";
        }
        if (metaWrap) metaWrap.style.transition = "";
      });
    });
  }

  function closeBeanDetail() {
    beanBody.classList.remove("bean-open");
    beanDetail.classList.remove("is-open");
    beanDetail.setAttribute("aria-hidden", "true");
    if (lastFocusedBean && typeof lastFocusedBean.focus === "function") lastFocusedBean.focus();
  }

  function wireBeanDetailClose() {
    var detail = document.getElementById("beanDetail");
    var inner = document.getElementById("beanDetailInner");
    if (!detail) return;
    detail.addEventListener("click", function (event) {
      if (event.target === detail || event.target === inner) closeBeanDetail();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && detail.classList.contains("is-open")) closeBeanDetail();
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
    wireCardExpansion(root);
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

    var photo = pouchImage(bean.id);
    var photoThumb = photo
      ? '<span class="bean-card-photo"><img src="' + photo + '" alt="" loading="lazy"></span>'
      : "";

    return (
      '<div class="bean-card' + (photo ? " has-photo" : "") + '"' + (photo ? ' data-id="' + escapeHtml(bean.id) + '" tabindex="0" role="button" aria-label="View ' + escapeHtml(bean.name) + ' pouch"' : "") + '>' +
        '<div class="bean-card-top">' +
          photoThumb +
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

  function wireCardExpansion(root) {
    Array.prototype.slice.call(root.querySelectorAll(".bean-card.has-photo")).forEach(function (card) {
      function open() {
        var bean = beanById[card.getAttribute("data-id")];
        if (bean) openBeanDetail(bean, card);
      }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  }

  function roastIndicator(roast) {
    if (!roast) return "";
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
    if (!bean.purchaseDate) return '<span class="empty-cell">-</span>';
    return escapeHtml(dateLabel(bean.purchaseDate));
  }

  function dateLabel(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /* ---------------- Cell helpers ---------------- */

  function cell(value) {
    return value === null || value === undefined || value === "" ? '<span class="empty-cell">-</span>' : escapeHtml(String(value));
  }

  function notesCell(tags) {
    if (!tags || tags.length === 0) return '<span class="empty-cell">-</span>';
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
