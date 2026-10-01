# Pipeline

- `raw/*.json`: one file per app, prices captured in the browser on 30 Sep 2026 (rows: item, product name, pack, price, MRP, out-of-stock flag).
- `capture_matcher.js`: the in-browser matcher that picked the listing closest to the standard pack for each item.
- `process.py`: validates each pick, converts to price per kg / L / 100 g / egg, and writes `../data.js` and `../data/prices.csv`. Run `python3 process.py` from this folder.
- `research.json`: the like-for-like market figures shown on the site, with sources.
- `amazon_img.json`: Amazon image IDs used for the product photos.
