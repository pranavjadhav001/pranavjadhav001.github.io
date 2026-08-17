(function () {
  "use strict";

  var EQUIPMENT = [
    {
      slug: "flair-pro-2",
      name: "Flair Pro 2",
      brand: null,
      price: "Rs. 31,000",
      image: "/img/equipment/flair-pro-2.png",
      description: "A manual lever espresso maker. Fully hands-on, full control over pressure profile, great for experimenting with different variables.",
      linkLabel: "Product page",
      link: "https://www.benkibrewingtools.com/products/flair-pro2-espresso-maker"
    },
    {
      slug: "hario-v60",
      name: "Hario V60",
      brand: null,
      price: "Rs. 2,250",
      image: "/img/equipment/hario-v60.png",
      description: "Plastic pourover V60 Dripper with glass carafe.",
      linkLabel: "Product page",
      link: "https://somethingsbrewing.in/products/hario-v60-coffee-server-02-set-manual-brewer-with-server-700ml-copy"
    },
    {
      slug: "timemore-c3",
      name: "Timemore Chestnut C3",
      brand: null,
      price: "Rs. 8,000",
      image: "/img/equipment/timemore-c3.png",
      description: "Always go for s2c burrs, this was solid pick and still paying to ths day.",
      linkLabel: "Product page",
      link: "https://somethingsbrewing.in/products/timemore-c3-hand-grinder"
    },
    {
      slug: "fellow-atmos",
      name: "Fellow Atmos",
      brand: null,
      price: "Rs. 3,200",
      image: "/img/equipment/fellow-atmos.png",
      description: "Vacuum-sealed storage canister. Keeps whole bean coffee from going stale between brews.",
      linkLabel: "Product page",
      link: "https://somethingsbrewing.in/products/fellow-atmos-vacuum-storage-canister-clear-glass"
    },
    {
      slug: "bialetti-brikka",
      name: "Bialetti Brikka",
      brand: null,
      price: "Rs. 9,000",
      image: "/img/equipment/bialetti-brikka.png",
      description: "The gold-standard moka pot, with an extra valve that produces a pseudo-crema on top. Where the espresso obsession quietly began.",
      linkLabel: "Product page",
      link: "https://www.amazon.in/gp/product/B089LZSR7M"
    },
    {
      slug: "kitchentour-scale",
      name: "KitchenTour Coffee Scale",
      brand: null,
      price: "Rs. 1,600",
      image: "/img/equipment/kitchentour-scale.png",
      description: "A decent scale which does its job well, has the mandatory properties - precision and timer.",
      linkLabel: "Product page",
      link: "https://www.amazon.in/gp/product/B083PX1VHG"
    },
    {
      slug: "wdt-tool",
      name: "WDT Tool",
      brand: null,
      price: "Rs. 400",
      image: "/img/equipment/wdt-tool.png",
      description: "Coffee ground distributer.",
      linkLabel: "Product page",
      link: "https://www.amazon.in/gp/product/B0CQM658F8"
    },
    {
      slug: "instacuppa-frother",
      name: "Instacuppa Milk Frother",
      brand: null,
      price: "Gift",
      image: "/img/equipment/instacuppa-frother.png",
      description: "A handheld electric whisk for frothing milk.",
      linkLabel: "Product page",
      link: "https://amzn.in/d/fgrqYsy"
    },
    {
      slug: "milk-pitcher",
      name: "Precise Pitcher",
      brand: null,
      price: "Rs. 800",
      image: "/img/equipment/milk-pitcher.png",
      description: "Stainless steel steaming pitcher, for the occasional attempt at latte art.",
      linkLabel: null,
      link: null
    },
    {
      slug: "tasting-cup",
      name: "Espresso shot cup",
      brand: null,
      price: null,
      image: "/img/equipment/tasting-cup.png",
      description: "A small double-espresso sized cup gift.",
      linkLabel: null,
      link: null
    },
    {
      slug: "sipologie-kettle",
      name: "Sipologie Gooseneck Kettle",
      brand: null,
      price: "Rs. 4,500",
      image: "/img/equipment/sipologie-kettle.png",
      description: "Precision electric gooseneck kettle.",
      linkLabel: "Product page",
      link: "https://sipologie.in/products/sipologie-precision-electric-gooseneck-kettle-2"
    },
    {
      slug: "klrex-club-mug",
      name: "Process Mug",
      brand: "KLREX Club",
      price: null,
      image: "/img/equipment/klrex-club-mug.png",
      description: "A souvenir mug picked up at KLREX Club in Kuala Lumpur.",
      linkLabel: null,
      link: null
    },
    {
      slug: "another-story-mug",
      name: "Another Story Mug",
      brand: null,
      price: null,
      image: "/img/equipment/another-coffee-mug.png",
      description: "A souvenir mug bought at Mano Plus, Kuala Lumpur.",
      linkLabel: null,
      link: null
    },
    {
      slug: "hario-switch",
      name: "Hario Switch",
      brand: null,
      price: "Gift",
      image: "/img/equipment/hario-switch.png",
      description: "Essential upgrade from the V60 for immersion and percolation brewing.",
      linkLabel: "Product page",
      link: "https://brewinggadgets.in/products/hario-v60-immersion-dripper-switch?variant=52120298389724"
    },
    {
      slug: "two-way-cup",
      name: "2-Way Cup",
      brand: null,
      price: "Gift",
      image: "/img/equipment/two-way-cup.png",
      description: "Delivers a different drinking experience depending on which side you sip from.",
      linkLabel: "Product page",
      link: "https://www.2-waycup.com/"
    },
    {
      slug: "budan-french-press",
      name: "Budan French Press",
      brand: null,
      price: "Rs. 1200",
      image: "/img/equipment/budan-french-press.png",
      description: "A staple to return to once in a while for cold brew or cascara.",
      linkLabel: "Product page",
      link: "https://somethingsbrewing.in/products/budan-french-press-glass-600-ml?srsltid=AfmBOooLMhYkG-kJVzBilv7ae3_ufSRcUc9MXqMccFgYRFP12IFMaR-F"
    }
  ];

  var grid, detail, detailInner, body;
  var lastFocused = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    grid = document.getElementById("equipmentGrid");
    detail = document.getElementById("equipmentDetail");
    detailInner = document.getElementById("equipmentDetailInner");
    body = document.body;
    if (!grid || !detail || !detailInner) return;

    renderGrid();
    wireDetailClose();
  }

  function renderGrid() {
    var html = "";
    EQUIPMENT.forEach(function (item) {
      html +=
        '<button type="button" class="equipment-card" data-slug="' + item.slug + '" aria-label="' + escapeHtml(item.name) + '">' +
        '<span class="equipment-card-image"><img src="' + item.image + '" alt="' + escapeHtml(item.name) + '" loading="lazy"></span>' +
        "</button>";
    });
    grid.innerHTML = html;

    Array.prototype.slice.call(grid.querySelectorAll(".equipment-card")).forEach(function (card) {
      card.addEventListener("click", function () {
        var item = EQUIPMENT.filter(function (e) { return e.slug === card.getAttribute("data-slug"); })[0];
        if (item) openDetail(item, card);
      });
    });
  }

  function openDetail(item, triggerEl) {
    lastFocused = triggerEl || null;

    var meta = "";
    if (item.brand) meta += '<p class="equipment-detail-brand">' + escapeHtml(item.brand) + "</p>";
    meta += "<h1>" + escapeHtml(item.name) + "</h1>";
    if (item.price) meta += '<p class="equipment-detail-price">' + escapeHtml(item.price) + "</p>";
    meta += "<p class=\"equipment-detail-desc\">" + escapeHtml(item.description) + "</p>";
    if (item.link) {
      meta +=
        '<a class="equipment-detail-link" href="' + item.link + '" target="_blank" rel="noopener">' +
        escapeHtml(item.linkLabel || "Product page") + " &#8599;</a>";
    }

    detailInner.innerHTML =
      '<div class="equipment-detail-image"><img src="' + item.image + '" alt="' + escapeHtml(item.name) + '"></div>' +
      '<div class="equipment-detail-meta">' + meta + "</div>";

    detail.setAttribute("aria-hidden", "false");

    var imageWrap = detailInner.querySelector(".equipment-detail-image");
    var metaWrap = detailInner.querySelector(".equipment-detail-meta");
    var thumb = triggerEl ? triggerEl.querySelector(".equipment-card-image") : null;
    var startRect = thumb ? thumb.getBoundingClientRect() : null;

    // FLIP: pin the image to where the clicked thumbnail actually sits
    // on screen (no transition), let that paint on its own frame, then
    // clear the pin so the element's own CSS transition animates from
    // that pinned start to its real, laid-out position and full size --
    // a grow-and-move into place instead of a fade-in-place. The text
    // block gets the same treatment from a fixed small offset since it
    // has no on-screen counterpart to originate from.
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
        body.classList.add("equipment-open");
        detail.classList.add("is-open");
        if (imageWrap) {
          imageWrap.style.transition = "";
          imageWrap.style.transform = "";
        }
        if (metaWrap) metaWrap.style.transition = "";
      });
    });
  }

  function closeDetail() {
    body.classList.remove("equipment-open");
    detail.classList.remove("is-open");
    detail.setAttribute("aria-hidden", "true");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function wireDetailClose() {
    detail.addEventListener("click", function (event) {
      // .equipment-detail-inner spans the full viewport height (it centers the
      // product column with align-items:center), so clicking in the empty
      // space around the image/text still lands on it, not on the outer
      // overlay. Treat clicks on either as "outside the product" and close.
      if (event.target === detail || event.target === detailInner) closeDetail();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && detail.classList.contains("is-open")) closeDetail();
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
