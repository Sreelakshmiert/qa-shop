(function () {
  const C = window.QACommon;
  const P = window.QAPromotions;
  const ORDER_KEY = "qa_ecommerce_last_order_v1";

  function getBilling() {
    return {
      firstName: document.getElementById("bill-first")?.value.trim(),
      lastName: document.getElementById("bill-last")?.value.trim(),
      email: document.getElementById("bill-email")?.value.trim(),
      address: document.getElementById("bill-address")?.value.trim(),
      city: document.getElementById("bill-city")?.value.trim(),
      zip: document.getElementById("bill-zip")?.value.trim(),
      country: document.getElementById("bill-country")?.value.trim(),
    };
  }

  function getShipping(same) {
    if (same) return { ...getBilling(), email: undefined };
    return {
      firstName: document.getElementById("ship-first")?.value.trim(),
      lastName: document.getElementById("ship-last")?.value.trim(),
      address: document.getElementById("ship-address")?.value.trim(),
      city: document.getElementById("ship-city")?.value.trim(),
      zip: document.getElementById("ship-zip")?.value.trim(),
      country: getBilling().country,
    };
  }

  function validateBilling(b) {
    if (!b.firstName || !b.lastName) return "Please enter your billing name.";
    if (!b.email || !b.email.includes("@")) return "Please enter a valid billing email.";
    if (!b.address || !b.city || !b.zip) return "Please complete billing address fields.";
    return "";
  }

  function validateShipping(s, same) {
    if (same) return "";
    if (!s.firstName || !s.lastName || !s.address || !s.city || !s.zip) return "Please complete shipping fields.";
    return "";
  }

  function render() {
    const state = window.QACartStore.getState();
    const pricing = P.calculatePricing(state.items, state.promos);
    const map = window.QACatalog.getProductMap();

    const empty = document.getElementById("checkout-empty");
    const wrap = document.getElementById("checkout-form-wrap");
    const hasItems = state.items.length > 0;
    if (empty) empty.hidden = hasItems;
    if (wrap) wrap.hidden = !hasItems;

    const linesHost = document.getElementById("checkout-lines");
    if (linesHost) {
      linesHost.innerHTML = state.items
        .map((line) => {
          const p = map[line.sku];
          if (!p) return "";
          return `<div class="kv"><span>${C.escapeHtml(p.name)} × ${line.qty}</span><span>${C.formatMoney(
            p.price * line.qty
          )}</span></div>`;
        })
        .join("");
    }

    const sumHost = document.getElementById("checkout-summary");
    if (sumHost) {
      sumHost.innerHTML = `
        <div class="kv"><span>Merchandise subtotal</span><span>${C.formatMoney(pricing.merchandiseSubtotal)}</span></div>
        <div class="kv"><span>FREEGIFT discount</span><span>−${C.formatMoney(pricing.freegiftTotal)}</span></div>
        <div class="kv"><span>SUNNY discount</span><span>−${C.formatMoney(pricing.sunnyTotal)}</span></div>
        <div class="kv"><span>Total discounts</span><span>−${C.formatMoney(pricing.discountTotal)}</span></div>
        <div class="kv kv--strong"><span>Final total</span><span>${C.formatMoney(pricing.finalTotal)}</span></div>
      `;
    }

    const promosHost = document.getElementById("checkout-promos");
    if (promosHost) promosHost.textContent = state.promos.length ? state.promos.join(", ") : "None";

    C.renderDebugPanel(pricing, state);
  }

  function showCheckoutError(msg) {
    const el = document.getElementById("checkout-error");
    if (!el) return;
    if (!msg) {
      el.style.display = "none";
      el.textContent = "";
      return;
    }
    el.style.display = "block";
    el.textContent = msg;
  }

  function placeOrder() {
    const same = !!document.getElementById("ship-same")?.checked;
    const b = getBilling();
    const err = validateBilling(b);
    if (err) {
      showCheckoutError(err);
      C.showToast(err, "error");
      return;
    }
    const s = getShipping(same);
    const err2 = validateShipping(s, same);
    if (err2) {
      showCheckoutError(err2);
      C.showToast(err2, "error");
      return;
    }
    showCheckoutError("");

    const state = window.QACartStore.getState();
    const pricing = P.calculatePricing(state.items, state.promos);
    const order = {
      id: `QA-${Date.now()}`,
      placedAt: Date.now(),
      items: state.items.slice(),
      promos: state.promos.slice(),
      pricing: {
        merchandiseSubtotal: pricing.merchandiseSubtotal,
        freegiftTotal: pricing.freegiftTotal,
        sunnyTotal: pricing.sunnyTotal,
        discountTotal: pricing.discountTotal,
        finalTotal: pricing.finalTotal,
        lines: pricing.lines,
        flags: pricing.flags,
      },
      billing: b,
      shipping: same ? { sameAsBilling: true, ...b } : s,
    };

    try {
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch (e) {
      showCheckoutError("Could not save order snapshot. Check browser storage settings.");
      C.showToast("Order could not be saved.", "error");
      return;
    }

    window.QACartStore.clearCart();
    C.showToast("Order placed successfully.", "success");
    const suffix = C.isDebugMode() ? "?debug=true" : "";
    window.location.href = `confirmation.html${suffix}`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    C.mountNav();
    C.updateHeaderCartCount();
    window.addEventListener("qa-cart-changed", () => {
      C.updateHeaderCartCount();
      render();
    });

    const sameBox = document.getElementById("ship-same");
    const shipFields = document.getElementById("shipping-fields");
    sameBox?.addEventListener("change", () => {
      if (shipFields) shipFields.style.display = sameBox.checked ? "none" : "block";
    });

    document.getElementById("btn-place-order")?.addEventListener("click", placeOrder);
    render();
  });
})();
