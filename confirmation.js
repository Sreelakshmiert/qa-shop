(function () {
  const C = window.QACommon;
  const ORDER_KEY = "qa_ecommerce_last_order_v1";

  function readOrder() {
    try {
      const raw = sessionStorage.getItem(ORDER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function renderOrder(o) {
    const map = window.QACatalog.getProductMap();
    const linesHost = document.getElementById("confirm-lines");
    const sumHost = document.getElementById("confirm-summary");
    const promosHost = document.getElementById("confirm-promos");
    if (!linesHost || !sumHost || !promosHost) return;

    linesHost.innerHTML = o.items
      .map((line) => {
        const p = map[line.sku];
        if (!p) return "";
        return `<div class="kv"><span>${C.escapeHtml(p.name)} × ${line.qty}</span><span>${C.formatMoney(
          p.price * line.qty
        )}</span></div>`;
      })
      .join("");

    const pr = o.pricing;
    sumHost.innerHTML = `
      <div class="kv"><span>Merchandise subtotal</span><span>${C.formatMoney(pr.merchandiseSubtotal)}</span></div>
      <div class="kv"><span>FREEGIFT discount</span><span>−${C.formatMoney(pr.freegiftTotal)}</span></div>
      <div class="kv"><span>SUNNY discount</span><span>−${C.formatMoney(pr.sunnyTotal)}</span></div>
      <div class="kv"><span>Total discounts</span><span>−${C.formatMoney(pr.discountTotal)}</span></div>
      <div class="kv kv--strong"><span>Final total</span><span>${C.formatMoney(pr.finalTotal)}</span></div>
    `;

    promosHost.textContent = o.promos && o.promos.length ? o.promos.join(", ") : "None";

    document.getElementById("order-id").textContent = o.id;
    document.getElementById("order-time").textContent = new Date(o.placedAt).toLocaleString();

    document.getElementById("bill-block").textContent = formatAddress(o.billing);
    document.getElementById("ship-block").textContent = formatAddress(o.shipping);
  }

  function formatAddress(a) {
    if (a.sameAsBilling) {
      return "Same as billing";
    }
    return [
      `${a.firstName || ""} ${a.lastName || ""}`.trim(),
      a.email || "",
      a.address || "",
      `${a.city || ""} ${a.zip || ""}`.trim(),
      a.country || "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  document.addEventListener("DOMContentLoaded", () => {
    C.mountNav();
    C.updateHeaderCartCount();
    window.addEventListener("qa-cart-changed", () => C.updateHeaderCartCount());

    const order = readOrder();
    const missing = document.getElementById("confirm-missing");
    const body = document.getElementById("confirm-body");
    if (!order) {
      if (missing) missing.hidden = false;
      if (body) body.hidden = true;
    } else {
      if (missing) missing.hidden = true;
      if (body) body.hidden = false;
      renderOrder(order);
      const fakeState = { items: order.items, promos: order.promos || [] };
      C.renderDebugPanel(order.pricing, fakeState);
    }
  });
})();
