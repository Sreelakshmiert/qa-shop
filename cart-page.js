(function () {
  const C = window.QACommon;
  const P = window.QAPromotions;

  function setPromoMessage(text, kind) {
    const el = document.getElementById("promo-message");
    if (!el) return;
    if (!text) {
      el.style.display = "none";
      el.textContent = "";
      el.className = "alert";
      return;
    }
    el.style.display = "block";
    el.textContent = text;
    el.className = `alert alert--${kind === "error" ? "error" : "success"}`;
  }

  function render() {
    const state = window.QACartStore.getState();
    const pricing = P.calculatePricing(state.items, state.promos);
    const map = window.QACatalog.getProductMap();

    const empty = document.getElementById("cart-empty");
    const filled = document.getElementById("cart-filled");
    const hasItems = state.items.length > 0;
    if (empty) empty.hidden = hasItems;
    if (filled) filled.hidden = !hasItems;

    const tbody = document.getElementById("cart-lines");
    if (tbody) {
      tbody.innerHTML = state.items
        .map((line) => {
          const p = map[line.sku];
          if (!p) return "";
          const sub = p.price * line.qty;
          return `<tr>
            <td>${C.escapeHtml(p.name)}</td>
            <td>${C.escapeHtml(p.sku)}</td>
            <td>${C.escapeHtml(p.category)}</td>
            <td>${C.formatMoney(p.price)}</td>
            <td>
              <input type="number" min="0" value="${line.qty}" data-sku="${C.escapeHtml(p.sku)}" class="js-qty" aria-label="Quantity for ${C.escapeHtml(
                p.sku
              )}" />
            </td>
            <td>${C.formatMoney(sub)}</td>
            <td>
              <button type="button" class="btn btn--ghost btn--small js-update" data-sku="${C.escapeHtml(p.sku)}">Update</button>
              <button type="button" class="btn btn--danger btn--small js-remove" data-sku="${C.escapeHtml(p.sku)}">Remove</button>
            </td>
          </tr>`;
        })
        .join("");
    }

    const applied = document.getElementById("applied-promos");
    if (applied) {
      if (state.promos.length === 0) {
        applied.innerHTML = `<span class="applied-promos-none">None</span>`;
      } else {
        applied.innerHTML = state.promos
          .map(
            (code) => `
          <div class="applied-promo-row">
            <span class="applied-promo-tag">${C.escapeHtml(code)}</span>
            <button type="button" class="btn btn--ghost btn--small js-remove-promo" data-code="${C.escapeHtml(code)}">Remove</button>
          </div>`
          )
          .join("");
        applied.querySelectorAll(".js-remove-promo").forEach((btn) => {
          btn.addEventListener("click", () => {
            const promoCode = btn.getAttribute("data-code");
            if (!promoCode) return;
            window.QACartStore.removePromo(promoCode);
            setPromoMessage("", "");
            C.showToast(`Removed promotion ${promoCode}.`, "success");
            render();
          });
        });
      }
    }

    const summary = document.getElementById("cart-summary");
    if (summary) {
      summary.innerHTML = `
        <div class="kv"><span>Merchandise subtotal</span><span>${C.formatMoney(pricing.merchandiseSubtotal)}</span></div>
        <div class="kv"><span>FREEGIFT discount</span><span>−${C.formatMoney(pricing.freegiftTotal)}</span></div>
        <div class="kv"><span>SUNNY discount</span><span>−${C.formatMoney(pricing.sunnyTotal)}</span></div>
        <div class="kv"><span>Discount breakdown</span><span>−${C.formatMoney(pricing.discountTotal)}</span></div>
        <div class="kv kv--strong"><span>Final total</span><span>${C.formatMoney(pricing.finalTotal)}</span></div>
      `;
    }

    C.renderDebugPanel(pricing, state);

    tbody &&
      tbody.querySelectorAll(".js-update").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sku = btn.getAttribute("data-sku");
          const row = btn.closest("tr");
          const input = row && row.querySelector(".js-qty");
          const qty = input ? Number(input.value) : 0;
          window.QACartStore.updateQty(sku, qty);
          C.showToast("Cart updated.", "success");
          render();
        });
      });

    tbody &&
      tbody.querySelectorAll(".js-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sku = btn.getAttribute("data-sku");
          window.QACartStore.removeItem(sku);
          C.showToast(`Removed ${sku} from cart.`, "info");
          render();
        });
      });
  }

  function applyPromo(code) {
    const state = window.QACartStore.getState();
    const res = P.validateApplyPromo(state.items, state.promos, code);
    if (!res.ok) {
      setPromoMessage(res.message || "Unable to apply promotion.", "error");
      C.showToast(res.message || "Promotion error", "error");
      return;
    }
    const c = String(code || "").trim().toUpperCase();
    const next = { ...state, promos: state.promos.concat([c]) };
    window.QACartStore.setState(next);
    setPromoMessage(`${c} applied successfully.`, "success");
    C.showToast(`${c} applied successfully.`, "success");
    const input = document.getElementById("promo-input");
    if (input) input.value = "";
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    C.mountNav();
    C.updateHeaderCartCount();
    window.addEventListener("qa-cart-changed", () => {
      C.updateHeaderCartCount();
      render();
    });

    document.getElementById("btn-clear-cart")?.addEventListener("click", () => {
      window.QACartStore.clearCart();
      setPromoMessage("", "");
      C.showToast("Cart cleared.", "info");
      render();
    });

    document.getElementById("btn-apply-promo")?.addEventListener("click", () => {
      const input = document.getElementById("promo-input");
      applyPromo(input && input.value);
    });

    document.getElementById("promo-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const input = document.getElementById("promo-input");
        applyPromo(input && input.value);
      }
    });

    render();
  });
})();
