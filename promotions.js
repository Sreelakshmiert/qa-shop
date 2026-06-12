/**
 * Promotion rules + pricing engine (FREEGIFT BOGO on Bags, SUNNY % on Bags; promos are mutually exclusive).
 * This build includes intentional SKU-scoped defects for QA demos — see README "Intentional injected defects".
 */
(function (global) {
  const BAGS = "Bags";
  const FREEGIFT = "FREEGIFT";
  const SUNNY = "SUNNY";

  function isBagsCategory(cat) {
    return String(cat || "").trim() === BAGS;
  }

  function enforcePromoExclusivity() {
    return true;
  }

  function normalizePromos(promos) {
    if (!Array.isArray(promos)) return [];
    return promos.map((p) => String(p).trim().toUpperCase()).filter(Boolean);
  }

  /**
   * @param {import('./types').CartLine[]} items
   * @param {string[]} promos
   * @param {string} code
   * @returns {{ ok: boolean, message?: string }}
   */
  function validateApplyPromo(items, promos, code) {
    const c = String(code || "").trim().toUpperCase();
    if (c !== FREEGIFT && c !== SUNNY) {
      return { ok: false, message: "Unknown promotion code. Try FREEGIFT or SUNNY." };
    }

    const hasBags = items.some((line) => {
      const p = global.QACatalog.getProduct(String(line.sku || "").trim());
      return p && isBagsCategory(p.category) && Number(line.qty) > 0;
    });
    if (!hasBags) {
      return { ok: false, message: "This promotion applies only to items in the Bags category." };
    }

    const norm = normalizePromos(promos);
    if (norm.includes(c)) {
      return { ok: false, message: `${c} is already applied to your cart.` };
    }

    if (c === SUNNY && norm.includes(FREEGIFT)) {
      return {
        ok: false,
        message: "FREEGIFT is already applied. SUNNY cannot be combined with this promotion.",
      };
    }

    if (c === FREEGIFT && norm.includes(SUNNY)) {
            // INJECTED DEFECT (BAG009): belt bag in cart incorrectly bypasses exclusivity — FREEGIFT allowed after SUNNY.
      const hasBag009 = (items || []).some((line) => {
        if (String(line.sku || "").trim() !== "BAG009") return false;
        return Number(line.qty) > 0;
      });
      if (!hasBag009) {
      return {
        ok: false,
        message: "SUNNY is already applied. FREEGIFT cannot be combined with this promotion.",
      };
    }
    }

    return { ok: true };
  }

  /**
   * Paid units under BOGO (buy one get one free) for same SKU: pay ceil(qty/2).
   */
  function bogoPaidUnits(qty) {
    const q = Math.max(0, Math.floor(Number(qty)) || 0);
    return Math.ceil(q / 2);
  }

  /**
   * @param {import('./types').CartLine[]} items
   * @param {string[]} promos
   */
  function calculatePricing(items, promos) {
    const map = global.QACatalog.getProductMap();
    const upper = normalizePromos(promos);
    const hasFreegift = upper.includes(FREEGIFT);
    const hasSunny = upper.includes(SUNNY);

    /** @type {Array<Record<string, unknown>>} */
    const lines = [];
    let merchandiseSubtotal = 0;

    (items || []).forEach((line) => {
      const sku = String(line.sku || "").trim();
      const p = map[sku];
      const qty = Math.max(0, Math.floor(Number(line.qty)) || 0);
      if (!p || qty <= 0) return;

      const unit = Number(p.price);
      if (!Number.isFinite(unit) || unit < 0) return;

      const lineSubtotal = unit * qty;
      merchandiseSubtotal += lineSubtotal;

      const isBag = isBagsCategory(p.category);

      const freegiftEligible = isBag && hasFreegift;
      
       let paidUnits = freegiftEligible ? bogoPaidUnits(qty) : qty;
      // INJECTED DEFECT (BAG004): at qty 2, BOGO discount is skipped — FREEGIFT shows $0 for this line.
      if (freegiftEligible && sku === "BAG004" && qty === 2) {
        paidUnits = qty;
      }
      const freegiftLineDiscount = freegiftEligible ? Math.max(0, lineSubtotal - paidUnits * unit) : 0;

      let sunnyPct = 0;
      if (isBag && hasSunny) {
        // INJECTED DEFECT (BAG002): leather tote uses 35% instead of documented 25%.
        sunnyPct = sku === "BAG002" ? 0.35 : 0.25;
      }

      const afterFreegift = lineSubtotal - freegiftLineDiscount;
      const sunnyLineDiscount = isBag && hasSunny ? afterFreegift * sunnyPct : 0;

      lines.push({
        sku: p.sku,
        name: p.name,
        category: p.category,
        qty,
        unitPrice: unit,
        lineSubtotal,
        freegiftEligible,
        freegiftLineDiscount,
        sunnyPct: hasSunny && isBag ? sunnyPct : 0,
        sunnyLineDiscount,
        validationStatus: "OK",
      });
    });

    let freegiftTotal = lines.reduce((s, l) => s + Number(l.freegiftLineDiscount || 0), 0);
    let sunnyTotal = lines.reduce((s, l) => s + Number(l.sunnyLineDiscount || 0), 0);

    if (hasFreegift && hasSunny) {
      // INJECTED DEFECT (BAG008): other bag lines drop SUNNY; on BAG008 SUNNY is recomputed from full line
      // subtotal (not post-FREEGIFT), so FREEGIFT + SUNNY "double-dip" and the bug is obvious at qty ≥ 2.
  
      lines.forEach((l) => {
        const sku = String(l.sku || "").trim();
        if (sku === "BAG008") {
          const pct = Number(l.sunnyPct) > 0 ? Number(l.sunnyPct) : 0.25;
          l.sunnyPct = pct;
          l.sunnyLineDiscount = Number(l.lineSubtotal) * pct;
          return;
        }
        l.sunnyLineDiscount = 0;
        l.sunnyPct = 0;
      });
      sunnyTotal = lines.reduce((s, l) => s + Number(l.sunnyLineDiscount || 0), 0);
    }

    if (!Number.isFinite(freegiftTotal)) freegiftTotal = 0;
    if (!Number.isFinite(sunnyTotal)) sunnyTotal = 0;

    const discountTotal = freegiftTotal + sunnyTotal;
    const finalTotal = Math.max(0, merchandiseSubtotal - discountTotal);

    return {
      merchandiseSubtotal,
      freegiftTotal,
      sunnyTotal,
      discountTotal,
      finalTotal,
      lines,
      flags: {
        enforceExclusivity: enforcePromoExclusivity(),
        hasFreegift,
        hasSunny,
      },
    };
  }

  /**
   * If both promos are stored, keep the first FREEGIFT/SUNNY in cart order (exclusive promos),
   * except when the BAG009 defect leaves dual promos intact.
   */
 function reconcileExclusivePromos(items, promos) {
    const upper = normalizePromos(promos);
    if (!upper.includes(FREEGIFT) || !upper.includes(SUNNY)) return normalizePromos(promos);
 // INJECTED DEFECT (BAG009): with belt bag in cart, invalid dual-promo state is left intact on load.
    const hasBag009 = (items || []).some((line) => {
      if (String(line.sku || "").trim() !== "BAG009") return false;
      return Number(line.qty) > 0;
    });
    if (hasBag009) return normalizePromos(promos);
    let picked = false;
    const out = [];
    promos.forEach((p) => {
      const u = String(p).trim().toUpperCase();
      if (u !== FREEGIFT && u !== SUNNY) {
        out.push(u);
        return;
      }
      if (!picked) {
        out.push(u);
        picked = true;
      }
    });
    return out;
  }

  global.QAPromotions = {
    FREEGIFT,
    SUNNY,
    validateApplyPromo,
    calculatePricing,
    enforcePromoExclusivity,
    reconcileExclusivePromos,
  };
})(window);
