# QA E-Commerce Demo

A static, **fully client-side** dummy storefront for **manual QA**, **automation practice**, **test case design**, **bug reporting demos**, and **portfolio** use.

## Run locally

Open `index.html` in a modern browser (double-click, or use any static file server). No build step is required.

Example with Python:

```bash
cd qa-ecommerce-demo
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Pages

| Page | File | Purpose |
|------|------|---------|
| Product listing | `index.html` | Browse Men, Women, Bags; add to cart |
| Cart | `cart.html` | Line items, promos, totals |
| Checkout | `checkout.html` | Billing/shipping forms, order summary |
| Confirmation | `confirmation.html` | Last order snapshot (session) |

## Images and styling (what is actually in the repo)

**There are no image files in this repository.** There is no `images/` folder and no `.png` / `.jpg` / `.svg` assets checked into Git.

- **Layout and “design”** come entirely from **`css/styles.css`**. If the site looks unstyled, the browser is not loading that file (wrong URL path or the file was not deployed).
- **Product pictures** are loaded at runtime from the internet (see **Tech** below): URLs built in **`js/catalog.js`**, plus fallbacks in **`js/plp.js`**. They are not local files. If your host or network blocks those domains, you may only see placeholders or broken-image icons until the SVG fallback runs.

## Deploying with Git (GitHub Pages, etc.)

1. **Publish the folder that contains `index.html` as the site root**  
   The live URL must resolve **`/css/styles.css`** and **`/js/catalog.js`** relative to that page.  
   Example: if the site is `https://username.github.io/repository-name/`, then `index.html`, `css/`, and `js/` must live at that same level in the deployed branch/folder.

2. **Do not open `index.html` from a random parent path**  
   If your repo root is not the app root (e.g. the app lives only under `qa-ecommerce-demo/` but Pages serves the repo root), either move these files to the published root or configure the host so the **document root** is the `qa-ecommerce-demo` directory.

3. **Case-sensitive servers (Linux)**  
   Paths are lowercase: `css/styles.css`, not `CSS/`.

4. **Check the browser Network tab**  
   - 404 on `styles.css` → path / deployment layout issue.  
   - 404 / blocked on `images.unsplash.com` → external images; fallbacks should still appear if Picsum / placehold.co / SVG are allowed.

## Persistence

- **Cart** (items + applied promo codes): `localStorage` key `qa_ecommerce_cart_v1`
- **Last order** (after Place order): `sessionStorage` key `qa_ecommerce_last_order_v1`

## QA debug panel

Append **`?debug=true`** to any page URL to show the floating **QA Debug** table (SKU-level pricing, eligibility, discount %, amounts, validation).

## Promotions (current behavior)

- **`FREEGIFT`** — Bags only. Same-SKU BOGO: you pay for **ceil(quantity ÷ 2)** units (e.g. qty 2 → pay 1; qty 4 → pay 2). Discount appears in the cart summary as **FREEGIFT discount**.
- **`SUNNY`** — Bags only. **25%** off each bag line (after FREEGIFT on that line, if both were ever present in bad data).
- **Exclusivity** — Only one of FREEGIFT / SUNNY can be active. Applying the second code shows the documented error message. If both codes are ever stored together (e.g. old tests), totals keep **FREEGIFT** and drop **SUNNY** on reload.
- On the **cart** page, each applied code has a **Remove** button that clears that promotion from the cart (and updates totals).

## Tech

HTML, CSS, vanilla JavaScript, responsive layout. Each product image tries **Unsplash**, then **Picsum** (SKU seed), then a **placehold.co** PNG with the SKU, then an **inline SVG** so a visible image always appears.
