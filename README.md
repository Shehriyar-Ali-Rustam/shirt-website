# TOUCHLINE — Football Shirt Store

A fast, dependency-free storefront for football shirts: plain HTML, CSS and JavaScript, with no build step.

## Run it

```bash
./start.sh            # or: python3 -m http.server 8080
```

Then open **http://localhost:8080**. You can also double-click `index.html` to open it straight from disk.

## What's inside

| Feature | Where |
| --- | --- |
| Live name & number print preview (product page, studio, kit builder) | `assets/js/shirt.js` |
| Shop with category chips, country, size-in-stock, price, sale and sort filters | `assets/js/app.js` → `renderGrid` |
| Quick-add sizes on hover, wishlist, recently viewed | `app.js` |
| Product view: Fan/Authentic edition, stock-aware sizes, size finder, retro condition grade | `app.js` → `renderPM` |
| Cart drawer with free-delivery progress, promo codes (`KICKOFF10`), checkout flow | `app.js` |
| Teamwear kit builder with automatic squad pricing tiers | `app.js` → `renderKB` |
| Instant search (`/` or `Ctrl+K`) with aliases like "barca" and "man utd" | `app.js` → `searchQuery` |
| £ / € / $ / Rs (PKR) currency switcher, next-day delivery countdown, drop countdown | `app.js` |

## Make it yours

Everything the shop displays lives in **`assets/js/data.js`**:

- `STORE`: prices for printing and authentic editions, free-delivery threshold, delivery options, promo codes, teamwear tiers and currency rates.
- `PRODUCTS`: each shirt's name, price, stock per size, photos and `kit` colours (used to draw the live back-print preview).
- `REVIEWS`: **sample reviews. Replace them with real customer reviews before launch.**

Before going live, also replace these:

- Ratings and review counts on products are placeholders.
- Policy claims (365-day returns, 9pm next-day cut-off, authenticity guarantee) must match what your business actually offers.
- Checkout is a demo and takes no payment. Connect Stripe, or move the catalogue to Shopify, to take real orders.

## Images

Photos are hot-linked from [Unsplash](https://unsplash.com) (free for commercial use). For a production store, use photos of your own stock, and make sure you have the right to sell any club-branded merchandise you list.
