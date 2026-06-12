(function (global) {
  const STORAGE_KEY = "qa_ecommerce_cart_v1";

  function defaultState() {
    return { items: [], promos: [] };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.items)) return defaultState();
      const next = {
        items: parsed.items
          .filter((l) => l && l.sku && Number.isFinite(Number(l.qty)))
          .map((l) => ({ sku: String(l.sku), qty: Math.max(0, Math.floor(Number(l.qty))) }))
          .filter((l) => l.qty > 0),
        promos: Array.isArray(parsed.promos)
          ? parsed.promos.map((p) => String(p).toUpperCase()).filter(Boolean)
          : [],
      };

      if (typeof global.QAPromotions !== "undefined" && global.QAPromotions.reconcileExclusivePromos) {
        const reconciled = global.QAPromotions.reconcileExclusivePromos(next.items, next.promos);
        if (JSON.stringify(reconciled) !== JSON.stringify(next.promos)) {
          next.promos = reconciled;
          try {
            save(next);
          } catch {
            /* ignore */
          }
        }
      }

      return next;
    } catch {
      return defaultState();
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("qa-cart-changed", { detail: state }));
  }

  function getState() {
    return load();
  }

  function setState(next) {
    save(next);
  }

  function addItem(sku, qty) {
    const q = Math.max(1, Math.floor(Number(qty)) || 1);
    const state = load();
    const idx = state.items.findIndex((i) => i.sku === sku);
    if (idx >= 0) state.items[idx].qty += q;
    else state.items.push({ sku, qty: q });
    save(state);
    return state;
  }

  function updateQty(sku, qty) {
    const q = Math.max(0, Math.floor(Number(qty)) || 0);
    const state = load();
    const idx = state.items.findIndex((i) => i.sku === sku);
    if (idx < 0) return state;
    if (q === 0) state.items.splice(idx, 1);
    else state.items[idx].qty = q;
    save(state);
    return state;
  }

  function removeItem(sku) {
    const state = load();
    state.items = state.items.filter((i) => i.sku !== sku);
    save(state);
    return state;
  }

  function clearCart() {
    const state = defaultState();
    save(state);
    return state;
  }

  /** @param {string} code */
  function removePromo(code) {
    const state = load();
    const c = String(code || "").trim().toUpperCase();
    state.promos = state.promos.filter((p) => String(p).trim().toUpperCase() !== c);
    save(state);
    return state;
  }

  /** @param {string[]} promos */
  function setPromos(promos) {
    const state = load();
    state.promos = promos.slice();
    save(state);
    return state;
  }

  global.QACartStore = {
    STORAGE_KEY,
    load,
    save,
    getState,
    setState,
    addItem,
    updateQty,
    removeItem,
    removePromo,
    clearCart,
    setPromos,
  };
})(window);
