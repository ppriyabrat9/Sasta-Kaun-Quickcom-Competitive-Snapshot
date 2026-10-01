# Sasta Kaun?

Same shopping list, six quick-commerce apps, ten Indian cities, one evening. A plain-language price study of Blinkit, Zepto, Swiggy Instamart, Flipkart Minutes, Amazon Now and JioMart for 28 everyday household items.

**Captured:** 30 September 2026 evening (6:25 pm to 11:30 pm IST), with gaps rechecked on 1 October, from each app's public website with the delivery location set to one PIN code per city. Shelf prices only: no login, no coupons, no fees.

## Run locally

Static site, no build step. From this folder (the one containing `index.html`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on Netlify via GitHub

1. Push this folder to a new GitHub repo (`index.html` at the repo root).
2. Netlify: Add new site, Import an existing project, GitHub, pick the repo.
3. Build command: leave empty. Publish directory: `.` (already set in `netlify.toml`).

## Images

- Platform logos: `assets/logos/` (supplied files).
- Product photos: `assets/img/<item-id>.jpg` is used first if present (potato and tomato are bundled). Otherwise the page loads the Amazon Now listing photo for that item.
- About-me photo: save it as `assets/img/me.jpg`. Until then the page shows your initials.
- If a web image fails, the page falls back to the bundled icons in `assets/icons/` (Microsoft Fluent Emoji, MIT licence).

## Data

- `data.js` holds every observation: platform, city, item, product name, pack, selling price, MRP, status and price per kg / L / 100 g / egg.
- `data/prices.csv` is the same data as a flat file.
- Status values: `ok` in stock, `oos` listed but out of stock, `na` not available (not listed at that PIN), `ns` app currently not servicing that PIN.
- `pipeline/` holds the raw captures and the script that builds `data.js`.

## Known limits

- One evening, one PIN per city. A snapshot, not a tracker.
- Amazon Now does not serve 400050 (Mumbai) or 700019 (Kolkata); the nearest served PINs 400016 and 700020 were used. Indore: currently not servicing (15 PINs tried).
- Flipkart Minutes: Bengaluru, Mumbai and New Delhi captured on 30 Sep; the other seven cities on 1 Oct after signing in.
- Every item first marked not available or out of stock was rechecked on 1 Oct.

## Credits

Built by Preetam Priyabrat. Independent study, no affiliation with any platform. Logos, product images and names belong to their owners and are shown for identification only.
