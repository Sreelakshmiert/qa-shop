/**
 * Seeded product catalog for QA e-commerce demo.
 * Primary images: Unsplash. Automatic fallbacks: Picsum → placehold.co PNG → inline SVG
 * so every SKU always ends up with a visible image when CDNs fail.
 */
(function (global) {
  const categories = {
    men: "Men",
    women: "Women",
    bags: "Bags",
  };

  /** @param {string} photoSlug e.g. "photo-1507003211169-0a1dd7228f2d" */
  function unsplashUrl(photoSlug) {
    return `https://images.unsplash.com/${photoSlug}?auto=format&fit=crop&w=480&h=620&q=82`;
  }

  const PRODUCTS = [
    // Men — distinct portrait / menswear shots (IDs chosen for stable Unsplash delivery)
    { sku: "MEN001", name: "Slim Oxford Shirt — White", category: categories.men, price: 49.5, unsplash: "photo-1521572163474-6864f9cf17ab" },
    { sku: "MEN002", name: "Merino Crewneck Sweater — Navy", category: categories.men, price: 79.0, unsplash: "photo-1472099645785-5658abf4ff4e" },
    { sku: "MEN003", name: "Stretch Chino — Khaki", category: categories.men, price: 69.5, unsplash: "photo-1500648767791-00dcc994a43e" },
    { sku: "MEN004", name: "Linen Blend Blazer — Stone", category: categories.men, price: 198.0, unsplash: "photo-1519085360753-af0119f7cbe7" },
    { sku: "MEN005", name: "Performance Polo — Heather Grey", category: categories.men, price: 44.0, unsplash: "photo-1507003211169-0a1dd7228f2d" },
    { sku: "MEN006", name: "Selvedge Denim Jean — Indigo", category: categories.men, price: 128.0, unsplash: "photo-1583195764036-6dc248ac07d9" },
    { sku: "MEN007", name: "Quilted Vest — Olive", category: categories.men, price: 98.0, unsplash: "photo-1492562080023-ab3db95bfbce" },
    { sku: "MEN008", name: "Cashmere Scarf — Charcoal", category: categories.men, price: 89.0, unsplash: "photo-1504593811423-6dd665756598" },
    { sku: "MEN009", name: "Leather Belt — Brown", category: categories.men, price: 55.0, unsplash: "photo-1535713875002-d1d0cf377fde" },
    { sku: "MEN010", name: "Wool Peacoat — Black", category: categories.men, price: 298.0, unsplash: "photo-1506794778202-cad84cf45f1d" },
    // Women — distinct model / womenswear shots
    { sku: "WOM001", name: "Silk Camisole — Ivory", category: categories.women, price: 58.0, unsplash: "photo-1534528741775-53994a69daeb" },
    { sku: "WOM002", name: "High-Rise Straight Jean — Vintage Blue", category: categories.women, price: 98.0, unsplash: "photo-1544005313-94ddf0286df2" },
    { sku: "WOM003", name: "Cashmere Cardigan — Camel", category: categories.women, price: 168.0, unsplash: "photo-1438761681033-6461ffad8d80" },
    { sku: "WOM004", name: "Pleated Midi Skirt — Black", category: categories.women, price: 88.0, unsplash: "photo-1494790108377-be9c29b29330" },
    { sku: "WOM005", name: "Linen Blend Trench — Sand", category: categories.women, price: 248.0, unsplash: "photo-1517841905240-472988babdf9" },
    { sku: "WOM006", name: "Pointelle Knit Top — Blush", category: categories.women, price: 62.0, unsplash: "photo-1524502399090-9da9e85ff08c" },
    { sku: "WOM007", name: "Tailored Wool Blazer — Navy Pinstripe", category: categories.women, price: 228.0, unsplash: "photo-1488426862026-3ee34a7d66df" },
    { sku: "WOM008", name: "Leather Ankle Boot — Cognac", category: categories.women, price: 198.0, unsplash: "photo-1529626455594-4ff0802cfb7e" },
    { sku: "WOM009", name: "Jersey Wrap Dress — Forest", category: categories.women, price: 118.0, unsplash: "photo-1487412720507-e7ab37603c6f" },
    { sku: "WOM010", name: "Quilted Crossbody — Mini", category: categories.women, price: 78.0, unsplash: "photo-1469334031218-a354aae2bcee" },
    // Bags — product-style bag / luggage photography (each a different shot)
    { sku: "BAG001", name: "Canvas Weekender — Natural", category: categories.bags, price: 95.0, unsplash: "photo-1590874103328-eac38a683ce7" },
    { sku: "BAG002", name: "Leather Tote — Saddle", category: categories.bags, price: 185.0, unsplash: "photo-1594221708779-94832f4320d1" },
    { sku: "BAG003", name: "Nylon Backpack — Black", category: categories.bags, price: 72.0, unsplash: "photo-1548036328-c9fa89d128fa" },
    { sku: "BAG004", name: "Structured Satchel — Burgundy", category: categories.bags, price: 210.0, unsplash: "photo-1553062407-5eeb7a07855b" },
    { sku: "BAG005", name: "Woven Straw Market Bag", category: categories.bags, price: 48.0, unsplash: "photo-1597487026991-c6dcc3caa9f2" },
    { sku: "BAG006", name: "Suede Clutch — Taupe", category: categories.bags, price: 65.0, unsplash: "photo-1584917865442-de89d88dcc4a" },
    { sku: "BAG007", name: "Roll-Top Messenger — Olive", category: categories.bags, price: 110.0, unsplash: "photo-1591343395088-e12058704cfa" },
    { sku: "BAG008", name: "Quilted Chain Shoulder Bag", category: categories.bags, price: 165.0, unsplash: "photo-1583394838336-acd9a6edd42f" },
    { sku: "BAG009", name: "Leather Belt Bag — Chestnut", category: categories.bags, price: 88.0, unsplash: "photo-1622560480602-d580a665dd3a" },
    { sku: "BAG010", name: "Hard-Shell Carry-On — Graphite", category: categories.bags, price: 245.0, unsplash: "photo-1566150905458-1bf2fc113f9d" },
  ];

  function hashToHue(str) {
    let h = 0;
    for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h % 360;
  }

  /**
   * Inline SVG placeholder when remote images fail to load.
   * @param {{ sku: string, name: string, category: string }} p
   */
  function productImageDataUri(p) {
    const seed = p.sku;
    const hue = hashToHue(seed);
    const hue2 = (hue + 38) % 360;

    let c1 = "#3d4f6f";
    let c2 = "#1e2a3d";
    if (p.category === categories.women) {
      c1 = `hsl(${hue}, 42%, 42%)`;
      c2 = `hsl(${hue2}, 38%, 28%)`;
    } else if (p.category === categories.bags) {
      c1 = `hsl(${hue}, 35%, 38%)`;
      c2 = `hsl(${hue2}, 30%, 22%)`;
    } else {
      c1 = `hsl(${hue}, 28%, 40%)`;
      c2 = `hsl(${hue2}, 24%, 24%)`;
    }

    const title = p.name.length > 42 ? `${p.name.slice(0, 40)}…` : p.name;
    const safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSku = String(p.sku).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const safeCategory = String(p.category).replace(/&/g, "&amp;").replace(/</g, "&lt;");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="520" viewBox="0 0 480 520">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="480" height="520" fill="url(#g)"/>
  <rect x="24" y="24" width="432" height="472" rx="18" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <text x="240" y="200" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-family="Segoe UI, system-ui, sans-serif" font-size="13" font-weight="600">OFFLINE FALLBACK</text>
  <text x="240" y="258" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, system-ui, sans-serif" font-size="22" font-weight="700">${safeSku}</text>
  <text x="240" y="308" text-anchor="middle" fill="rgba(255,255,255,0.92)" font-family="Segoe UI, system-ui, sans-serif" font-size="15" font-weight="500">${safeTitle}</text>
  <text x="240" y="338" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="Segoe UI, system-ui, sans-serif" font-size="13">${safeCategory}</text>
</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function enrich(p) {
    const { unsplash, ...rest } = p;
    const primary = unsplashUrl(unsplash);
    const picsum = `https://picsum.photos/seed/qa-shop-${encodeURIComponent(p.sku)}/480/620`;
    const placehold = `https://placehold.co/480x620/0f172a/94a3b8/png?font=source-sans-pro&text=${encodeURIComponent(p.sku)}`;
    const rasterChain = [primary, picsum, placehold];
    const svg = productImageDataUri({ ...rest, sku: p.sku });
    return {
      ...rest,
      image: primary,
      imageUrlChain: encodeURIComponent(JSON.stringify(rasterChain)),
      imageSvgFallback: encodeURIComponent(svg),
    };
  }

  const catalog = PRODUCTS.map(enrich);

  function getCatalog() {
    return catalog.slice();
  }

  function getProductMap() {
    /** @type {Record<string, object>} */
    const map = {};
    catalog.forEach((p) => {
      map[p.sku] = p;
    });
    return map;
  }

  function getProduct(sku) {
    return getProductMap()[sku] || null;
  }

  global.QACatalog = {
    getCatalog,
    getProductMap,
    getProduct,
    CATEGORIES: categories,
  };
})(typeof window !== "undefined" ? window : globalThis);
