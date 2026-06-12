(function () {
  const C = window.QACommon;
  const catalog = window.QACatalog.getCatalog();
  const cats = ["All", window.QACatalog.CATEGORIES.men, window.QACatalog.CATEGORIES.women, window.QACatalog.CATEGORIES.bags];

  let active = "All";

  function renderFilters() {
    const host = document.getElementById("category-filters");
    if (!host) return;
    host.innerHTML = cats
      .map(
        (c) =>
          `<button type="button" class="chip${c === active ? " is-on" : ""}" data-cat="${C.escapeHtml(c)}">${C.escapeHtml(
            c
          )}</button>`
      )
      .join("");
    host.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        active = btn.getAttribute("data-cat") || "All";
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    const list = catalog.filter((p) => active === "All" || p.category === active);
    grid.innerHTML = list
      .map((p) => {
        return `
        <article class="card" data-sku="${C.escapeHtml(p.sku)}">
          <div class="card__media">
            <img src="${C.escapeHtml(p.image)}" data-urls="${p.imageUrlChain || ""}" data-svgfb="${p.imageSvgFallback || ""}" alt="${C.escapeHtml(
              p.name
            )}" loading="lazy" width="480" height="520" decoding="async" referrerpolicy="no-referrer-when-downgrade" />
          </div>
          <div class="card__body">
            <div class="badge">${C.escapeHtml(p.category)}</div>
            <h2 class="card__title">${C.escapeHtml(p.name)}</h2>
            <div class="card__meta">
              <span class="price">${C.formatMoney(p.price)}</span>
              <span class="sku">${C.escapeHtml(p.sku)}</span>
            </div>
            <div class="row-actions">
              <label class="visually-hidden" for="qty-${C.escapeHtml(p.sku)}">Quantity</label>
              <input type="number" id="qty-${C.escapeHtml(p.sku)}" min="1" value="1" aria-label="Quantity for ${C.escapeHtml(
                p.name
              )}" />
              <button type="button" class="btn btn--primary js-add" data-sku="${C.escapeHtml(p.sku)}">Add to cart</button>
            </div>
          </div>
        </article>`;
      })
      .join("");

    grid.querySelectorAll(".card__media img").forEach((img) => {
      img.addEventListener("error", function onProductImgError() {
        let urls = [];
        try {
          const raw = this.getAttribute("data-urls");
          if (raw) urls = JSON.parse(decodeURIComponent(raw));
        } catch (e) {
          urls = [];
        }
        const cur = Number(this.dataset.qaChain || 0);
        const next = cur + 1;
        this.dataset.qaChain = String(next);
        if (next < urls.length) {
          this.src = urls[next];
          return;
        }
        this.removeEventListener("error", onProductImgError);
        const svgEnc = this.getAttribute("data-svgfb");
        if (svgEnc) {
          try {
            this.src = decodeURIComponent(svgEnc);
          } catch (e2) {
            /* ignore */
          }
        }
      });
    });

    grid.querySelectorAll(".js-add").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sku = btn.getAttribute("data-sku");
        const card = btn.closest(".card");
        const input = card && card.querySelector('input[type="number"]');
        const qty = input ? Number(input.value) : 1;
        window.QACartStore.addItem(sku, qty);
        C.showToast(`Added ${sku} × ${Math.max(1, Math.floor(qty) || 1)} to cart.`, "success");
        C.updateHeaderCartCount();
        refreshDebug();
      });
    });
  }

  function refreshDebug() {
    const state = window.QACartStore.getState();
    const pricing = window.QAPromotions.calculatePricing(state.items, state.promos);
    C.renderDebugPanel(pricing, state);
  }

  function injectVisuallyHiddenCss() {
    if (document.getElementById("qa-visually-hidden-style")) return;
    const s = document.createElement("style");
    s.id = "qa-visually-hidden-style";
    s.textContent = `.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}`;
    document.head.appendChild(s);
  }

  document.addEventListener("DOMContentLoaded", () => {
    injectVisuallyHiddenCss();
    C.mountNav();
    C.updateHeaderCartCount();
    window.addEventListener("qa-cart-changed", () => {
      C.updateHeaderCartCount();
      refreshDebug();
    });
    renderFilters();
    renderGrid();
    refreshDebug();
  });
})();
