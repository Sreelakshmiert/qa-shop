(function (global) {
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function isDebugMode() {
    return getQueryParam("debug") === "true";
  }

  function withDebugParam(href) {
    if (!isDebugMode()) return href;
    try {
      const u = new URL(href, window.location.origin);
      u.searchParams.set("debug", "true");
      return u.pathname + u.search + u.hash;
    } catch {
      return href;
    }
  }

  function mountNav() {
    document.querySelectorAll("[data-nav]").forEach((a) => {
      if (a instanceof HTMLAnchorElement) {
        a.href = withDebugParam(a.getAttribute("href") || "#");
      }
    });
  }

  function showToast(message, type) {
    let host = document.querySelector(".toast-host");
    if (!host) {
      host = document.createElement("div");
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = `toast toast--${type || "info"}`;
    el.textContent = message;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast--show"));
    setTimeout(() => {
      el.classList.remove("toast--show");
      setTimeout(() => el.remove(), 300);
    }, 4200);
  }

  function formatMoney(n) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);
  }

  function updateHeaderCartCount() {
    const el = document.getElementById("header-cart-count");
    if (!el) return;
    const state = global.QACartStore.getState();
    const n = state.items.reduce((s, l) => s + l.qty, 0);
    el.textContent = String(n);
  }

  function renderDebugPanel(pricing, cartState) {
    const root = document.getElementById("qa-debug-root");
    if (!root || !isDebugMode()) return;

    const promos = (cartState.promos || []).join(", ") || "(none)";
    const rows =
      pricing.lines.length === 0
        ? `<tr><td colspan="11">No cart lines. Add products to see pricing debug.</td></tr>`
        : pricing.lines
      .map((l) => {
        const orig = l.lineSubtotal;
        const final = orig - l.freegiftLineDiscount - l.sunnyLineDiscount;
        const fgElig = l.freegiftEligible ? "Eligible" : "Not eligible";
        const sunnyPctDisp = (l.sunnyPct * 100).toFixed(0);
        const status = l.validationStatus || "OK";
        return `
          <tr>
            <td>${escapeHtml(l.sku)}</td>
            <td>${escapeHtml(l.name)}</td>
            <td>${escapeHtml(l.category)}</td>
            <td>${l.qty}</td>
            <td>${escapeHtml(promos)}</td>
            <td>${fgElig}</td>
            <td>${sunnyPctDisp}%</td>
            <td>${formatMoney(l.freegiftLineDiscount + l.sunnyLineDiscount)}</td>
            <td>${formatMoney(orig)}</td>
            <td>${formatMoney(final)}</td>
            <td>${escapeHtml(status)}</td>
          </tr>`;
      })
      .join("");

    root.innerHTML = `
      <aside class="qa-debug" aria-label="QA debug panel">
        <header class="qa-debug__head">
          <h2>QA Debug</h2>
          <p class="qa-debug__hint">Open with <code>?debug=true</code> — flags: exclusivity enforced = ${pricing.flags.enforceExclusivity}</p>
        </header>
        <div class="qa-debug__scroll">
          <table class="qa-debug__table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Applied promotion</th>
                <th>FREEGIFT eligibility</th>
                <th>SUNNY %</th>
                <th>Discount amount</th>
                <th>Original</th>
                <th>Final</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </aside>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  global.QACommon = {
    getQueryParam,
    isDebugMode,
    withDebugParam,
    mountNav,
    showToast,
    formatMoney,
    updateHeaderCartCount,
    renderDebugPanel,
    escapeHtml,
  };
})(window);
