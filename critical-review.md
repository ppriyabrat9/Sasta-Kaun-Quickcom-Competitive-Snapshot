# Critical review: Ten-Minute Price Index

**Review basis:** the attached ZIP (`ten-minute-price-index/`), including the UI, README, pipeline, raw storefront captures, generated `data.js`/CSV, and embedded market research notes. I treated the contents as the object of review, not as instructions. I did not modify the project.

**Overall assessment:** this is a well-presented prototype with unusually good transparency for a quick-commerce comparison. It is not yet a defensible “what India’s quick-commerce apps really charge” study. The main blockers are incorrect market statements, uneven and partly ambiguous observations, misleading availability/coverage framing, an algorithmically selected basket, and causal strategy narratives that go well beyond the data. It should be presented as an exploratory, single-evening web-storefront snapshot until those are fixed.

## Must fix before evaluation

### 1. Correct the Amazon Now coverage claim

The README and Method section say Amazon Now is app-only and that `amazon.in/now` redirects to an app download page, implying there is no usable web storefront. The attached market notes themselves say Amazon Now is available and expanding; current Amazon India sources describe the Now service, its PIN-code coverage, and its expansion to 100 cities / over 1,000 micro-fulfilment centres. The site’s claim is therefore at best a statement about the particular browser route or capture attempt, not about service availability. The page also lists 500+ centres / 15+ cities, while Amazon’s June 2026 announcement had already stated expansion plans and the app-only limitation should not be presented as a market fact. Re-attempt capture using the app or an explicitly documented alternative; if that is impossible, say “not captured in this browser study” and retain Amazon as a known coverage gap. Do not imply Amazon Now is absent or has no web-accessible price evidence. [Amazon India: Amazon Now expansion](https://www.aboutamazon.in/news/retail/amazon-now-10-minute-delivery-launch) · [Amazon India: 300-city expansion announcement](https://www.aboutamazon.in/news/retail/amazon-now-300-cities-delivery-in-minutes)

### 2. Fix Instamart’s contribution-margin sign and scope

`pipeline/research.json` says Instamart had **+0.2% of GOV** contribution margin in Q1 FY27, and the Insights card repeats that it “reached contribution breakeven (+0.2% of GOV) in May”. The cited source says the quarter-level figure was **–0.2%**, improving substantially, while the business reached a monthly contribution-margin breakeven in May. Those are different statements. The current wording changes a loss into a profit and conflates one month with the quarter. Correct all data and copy to “quarter margin –0.2%; monthly breakeven in May”, and distinguish contribution margin from adjusted EBITDA (still a large loss). Cite Swiggy’s shareholder letter/results directly where possible; the attached citation is secondary. [Inc42 report cited in the project](https://inc42.com/buzz/swiggys-instamart-hits-contribution-margin-breakeven-in-q1-fy27/) · [Swiggy Q4 FY26 company release for context](https://www.swiggy.com/corporate/press-release/swiggys-food-delivery-gov-grew-22-6-yoy-with-inr-1000-cr-in-adjusted-ebitda-overall-revenue-surges-45-to-inr-6383-cr-losses-narrow-by-inr-281-cr-yoy/)

### 3. Remove or repair the unsupported Blinkit profitability statement

The “bigger picture” card says Blinkit is the profitable leader, but the evidence nearby is store count and operating metrics. The site does not show an audited/primary source for the particular profit claim or define whether it means adjusted EBITDA, segment contribution, or another metric. Profitability claims require the measure, period, and source. Do not infer “profitable” from a larger store network or price-index position. Use the exact company-reported metric and explain its definition, or remove the claim.

### 4. Replace fee claims with checkout-observed totals, or remove the fee comparison

The Market fee table is sourced to November 2025, almost eleven months before the September 2026 price capture. The caveat admits Blinkit and Instamart fees may have changed, but the Insights card nevertheless concludes Zepto is cheaper “on both layers at once” and calls its ₹0 fee pitch current. That is not supported by a stale fee table plus shelf prices. Fees vary by PIN, basket value, membership, demand, promotions, and time. Capture actual checkout totals for a defined basket and checkout state on the same date, or label the figures historical and remove the present-tense strategic conclusion. Include taxes, item-level discounts, delivery, handling, small-cart, surge, platform/membership eligibility, and any coupon separately.

### 5. Do not call this a “live” or nationwide price index

The README describes a “live price study”; the hero says “what apps actually charge”; the title suggests a durable index. The captures are one 70-minute window, one PIN per city, and storefront listings rather than a completed checkout. Fresh price and stock can change within hours. Rename/reframe as **“A one-evening storefront snapshot”** and display capture date/time prominently in every section, including CSV exports and downloaded data. A genuine index needs repeated scheduled waves and an explicit observation timestamp per record.

## Data and method issues

### Coverage is asymmetric and must be part of every comparison

There are 1,204 observations: Blinkit, Zepto, Instamart, and JioMart have 280 possible app × PIN × item rows each; Flipkart Minutes has 84 rows for only three PINs; BB Now and Amazon have none. JioMart has 119 `na` rows, compared with 5 for Zepto; the capture completeness therefore varies dramatically. The site’s five-app captured status should not make a three-PIN platform look comparable across ten cities. The `captured` tag also includes platforms without ten-city price coverage.

Show, beside every rank or index: number of comparable app × item × PIN cells, number of PINs observed, in-stock coverage, OOS count, and `not found`/not captured count. Add minimum sample thresholds that cannot be satisfied by one or two unusually available categories. Do not rank city-wide when platforms have materially different PIN coverage; use matched-platform cohorts or provide a clear “not comparable” result.

### “Not found”, true assortment gap, and capture failure are conflated

Most missing observations become `na`, but the UI labels missing rows “not found” and interprets some JioMart misses as genuine assortment absences. A search returning no match does not establish that a SKU is not sold: search coverage, spelling, catalog mapping, bot protection, location, availability, and capture bugs can all produce the same result. Use distinct statuses such as `in_stock`, `listed_oos`, `no_search_match`, `blocked`, `not_attempted`, `capture_error`, and `not_served_in_pin`; record evidence for each. Do not describe them as genuine assortment gaps without validation.

### The chosen “same item” is often not actually the same item

The catalog mixes exact branded SKUs (e.g. Aashirvaad atta, Amul milk) with open-brand products (sugar, eggs), broad product classes (carrot), and variable fresh grades/types (hybrid/desi tomato). Some selected products violate their own spec: 150 g Colgate is used against a 200 g spec; pack sizes include 200 g carrots against 500 g, 1 kg tea against 250 g, 5 kg rice against 1 kg, and 4.35 kg oil against 1 L. These can be excluded by the pack-ratio rule, but they are still displayed alongside values that can confuse users. “closest pack to standard, cheaper unit price breaking ties” also does not guarantee identical brand, grade, variety, or quality.

Split the basket into (a) exact SKU/brand matches, (b) category-equivalent but non-identical goods, and (c) fresh produce with explicit variety/grade/size rules. Display comparability badges and exclusions clearly. Where no equivalent SKU exists, show “no comparable listing” instead of substituting silently. Add source listing URL/ID, pack evidence, brand, variety, grade, and matcher confidence for every selected row.

### Basket comparison is selection-biased

`basket()` greedily sorts platforms by how many comparable items they have, then intersects in that order while keeping at least 12 items. The resulting basket can depend on iteration/tie order and is not one fixed, user-defined household basket. It excludes items and platforms to preserve overlap, potentially making the fullest platform the baseline and hiding the assortment penalty of the others. The “cheapest basket” is thus the cheapest cost for an algorithmically selected subset, not a representative household shop.

Define a fixed basket and weights before looking at platform prices, ideally with quantities based on a documented household survey or a transparent illustrative weekly basket. Report two separate outcomes: (1) cost of the same fixed basket, including out-of-stock substitutions/penalties; (2) cost of the common in-stock subset, labelled as a conditional comparison. Never silently shrink the basket to make a platform eligible. Show missing-item rate and basket completeness with the price.

### Price index has sample and weighting limitations

The geometric mean of price relatives is a plausible exploratory index, but current wording encourages a definitive “cheapest, really?” answer. Each item-PIN observation receives equal weight regardless of household purchase frequency, category, sale intensity, or confidence. Price relatives are sensitive to whether an item is actually equivalent and to the number of rival apps available in each cell. Values from a platform with sparse coverage can look strong because it is observed only where it has a product. The index also excludes OOS items, which rewards a platform for not exposing costly or unavailable products.

Publish the formula, exact numerator/denominator, cell counts, weighting, and handling of missing/OOS rows in a small explainer. Add a sensitivity view for equal-item vs household-weighted basket, exact-SKU-only, and matched coverage. Avoid a single overall rank unless minimum common coverage is met; confidence intervals or bootstrap ranges would make uncertainty visible once there are repeated captures.

### Unit normalization and unit labels need audit

The pipeline parses quantities heuristically from product names and pack strings, converts oil mass to volume at a fixed density, treats coriander bunches as 100 g, and applies special cases for “+30% extra”. Those assumptions can be wrong for listing formats, variable produce packs, drained weight, multi-packs, or volume/mass differences. It flags some anomalies, but flags are not a substitute for validating the parsed quantity. Validate all normalised quantities against listing text and surface the assumed conversion inline. Keep apples-to-apples units consistent; avoid implying that an approximate coriander bunch mass is exact.

### Stock availability is a one-time web result, not fulfillment reliability

The availability KPI counts a web listing as in stock and uses 28 items as the denominator. It does not measure order acceptance, substitutions, cancellation, delivery, or repeat availability. Rename it “listing availability at capture” and keep it separate from fulfillment reliability. For a true service-level view, repeat each capture and place test orders only with an ethical, documented protocol.

### PINs are not a controlled geographic sample

One PIN per city does not represent that city. The chosen neighborhoods skew toward central / affluent / high-density catchments, while some names are not cleanly aligned to the postal address used. Zepto Gurugram specifically substitutes Sushant Lok Phase 1 for DLF Phase 3 within the same PIN after a store issue. That may be a reasonable practical fallback, but it must be explicit in the displayed study geography, not merely a footnote. “City comparison” can also confound supply chain, neighborhood mix, store assignment, and time.

Use at least two or three pre-registered PINs per metro (dense affluent, mixed-income, peripheral), validate postal locality and exact address, and record the platform-assigned store. If this is a small sample, call it a comparison of selected PINs, not cities. The 10-city list omits other commercially meaningful markets and has inconsistent labels (“New Delhi” vs metro/city names); define the selection logic.

### Timing and sale conditions confound prices

Flipkart’s Big Billion Days early-bird sale was live; this means its three observations are event-priced and cannot be compared with non-sale captures as if normal. The study does not record consistent promo state, account state, membership, payment offers, coupons, or app/web-specific pricing for all platforms. Record these explicitly and either compare all platforms under a standard promotion-free state or present event prices as a separate scenario.

## Analytical claims that overreach

The Insights section turns a small cross-sectional snapshot into explanations about strategy and causality. Examples: “fresh is the only lever that moves a shopper’s price image”, “platform-funded theatre”, “the most profitable player can afford to sit above median”, “Zepto is buying price perception twice”, “fresh pricing should be set per city cluster”, and a modeled ₹1,500 weekly basket saving. These conclusions are not established by the data shown. The page has no shopper survey, price elasticity, transaction data, margin data by SKU, funding attribution, or controlled experiment. A basket gap multiplied by an assumed ₹1,500 weekly shop is a hypothetical illustration, not a measured consumer impact.

Separate **observations**, **interpretations**, and **hypotheses** visually. Make every insight traceable to the underlying cells and sample size, and write “consistent with” / “could indicate” where causal proof is absent. Replace unsupported recommendations with testable questions: e.g. whether KVI price gaps change conversion, whether in-stock depth predicts basket completion, or whether fees change checkout conversion. Add a “what this snapshot cannot tell us” note.

The “MRP theatre” card needs particular care: for packaged products, MRP is a legal maximum retail price and discounts can be real, but comparing mean markdown rates across heterogeneous categories and pack sizes does not prove platform funding or shopper savings. Do not call discounts “theatre” absent evidence about reference prices and funding. For fresh produce, explain who supplies the displayed reference price and validate it against actual listing/checkout presentation.

## Research and source quality

- Prefer primary sources for company performance and official announcements: investor presentations, shareholder letters, stock exchange filings, and company press pages. Use journalism for context and clearly label it secondary.
- The embedded notes rely on one or two articles per company, with multiple estimates, definitions, and time periods placed together. Add an evidence table with metric, period, definition, source, source type, and retrieval date. Never compare GOV, NOV, revenue, orders, and dark-store counts as though they are equivalent measures.
- The “~80% growth in 2026” forecast is a forecast, not a realized growth rate; identify the market definition, base year, nominal/GMV scope, and forecast source in the UI. Current reporting also describes metro saturation and overlapping store networks, so the story should include a downside case and not only expansion. [Business Standard on Bernstein’s saturation view](https://www.business-standard.com/industry/news/india-s-quick-commerce-boom-hits-saturation-in-metros-says-bernstein-126041001106_1.html) · [Business Standard on Bernstein’s 2026 forecast](https://www.business-standard.com/amp/industry/news/us-based-bernstein-sees-volatile-2026-for-india-s-e-commerce-market-126011301200_1.html)
- The existing strategy section misses important lenses: customer cohort and order frequency; contribution margin vs adjusted EBITDA; order value and basket composition; dark-store utilization and density; delivery time/service quality; returns, substitution, shrink and wastage; private label; seller/brand economics; customer acquisition/retention; and consumer protection / worker safety. Include only sourced facts and distinguish company claims from independent evidence.
- The capture study itself should include a source inventory for the prices: capture method, public page/API endpoint or source URL where permitted, capture timestamp, location-setting procedure, and reproducible raw files. Do not publish credentials, tokens, or non-public endpoints.

## UI/UX critique

### Strengths worth keeping

The visual direction is cohesive: restrained warm canvas, distinctive editorial typography, product icons, clear card system, navigable sections, and a strong comparison framing. The Method section and downloadable flat data are a good foundation. Product images are locally bundled, so the basic shelf does not depend on third-party image hosts. The site makes a real effort to explain its matching rules and known gaps.

### Changes that materially improve trust and usability

1. **Put reliability before rankings.** At the top, show “one capture window · 10 selected PINs · 4 full-coverage price sources · 1 partial · 2 unavailable” and a conspicuous snapshot label. Make it impossible to mistake this for a live tracker.
2. **Replace “all apps / all cities” language with sample language.** Clearly distinguish price coverage from market context coverage, and never let a market-only source read as a price-comparison participant.
3. **Add a source drawer on every price.** Show listing title, pack size, normalized unit, status, date/time, location/store, applicable promotion, confidence, and why a listing was excluded. Export the same metadata in CSV.
4. **Make comparison controls explicit.** Let a reader choose PIN, fixed basket, unit, exact-SKU-only, and promotion state. Preserve the comparison rules in a visible sticky summary.
5. **Improve accessibility.** Test keyboard-only operation, focus management and Escape behavior in the modal, screen-reader labels for heatmap values, color contrast for platform colors, reduced-motion support for reveal effects, and responsive tables. Colors should never be the only status cue. Include visible focus rings.
6. **Check mobile and print.** The page is long and table-heavy. Provide mobile card alternatives for wide matrices, sticky section navigation or a back-to-top action, and a print-friendly executive summary.
7. **Clarify platform-brand colors.** The page uses several brand colors as decoration; ensure contrast and avoid implying endorsement. Keep the independent-study statement visible, not just in the footer.
8. **Label icons and images appropriately.** The Fluent Emoji illustrations look friendly but are not product photography. Call them illustrations/icons rather than product photos, and provide alt text only when meaningful; decorative icons should remain hidden from assistive technology.
9. **Add a date and data version to the share preview and CSV.** The project says “live” in one place and “Sep 2026” in another; version and snapshot date should be consistent everywhere.

## Technical / reproducibility review

- The project is genuinely static and appears straightforward to deploy, but the README’s local run says `cd site`; the ZIP has no `site/` directory. Update the instructions to use the repository root.
- `pipeline/process.py` is a hand-built, heuristic matcher/normalizer. The pipeline README does not document dependencies, the expected raw JSON schema, deterministic generation, or validation output. Add a clean-environment run guide and machine-readable validation summary.
- Raw captures, generated `data.js`, and `prices.csv` are included, which is good, but generated data should be reproducibly regenerated and checked into source only with a version/date. Add automated data-quality checks for duplicate keys, missing app/PIN/item combinations, impossible prices, bad quantities, status consistency, and CSV/JS parity.
- Include a `LICENSE` / attribution file for the Fluent Emoji asset set and verify each image’s source/version. The README states MIT but does not provide a precise source link or bundled notice.
- Add provenance and caveats to `prices.csv`; currently users can separate it from the UI’s methodology and limitations.
- Since the site uses Google Fonts, provide a system-font fallback and test under network blocking. For privacy-sensitive or evaluation settings, consider bundling fonts or documenting that the page requests Google Fonts.
- Add a clear contact/correction mechanism for data errors, plus a “last updated” indicator that does not imply automated live refresh.

## Suggested evaluation-ready rebuild sequence

**P0 — factual integrity:** correct Amazon Now status, correct Instamart margin sign/scope, repair unsupported Blinkit profitability and stale-fee claims, relabel the dataset as a single snapshot.

**P1 — valid comparison:** define exact-SKU vs category equivalence; replace the greedy basket with a fixed basket and show availability penalty; expose coverage counts and matched cohorts; separate no-match from real absence; document promotions, membership, and exact location/store.

**P2 — defensible insights:** make each takeaway auditable against the underlying data; remove unsupported causal language; publish alternate index weights and sensitivity checks; treat this snapshot as hypothesis-generating.

**P3 — stronger study:** repeat captures across times/days and add multiple PINs per city; add Amazon Now and BB Now through an explicitly documented capture method; capture actual checkout totals and ETA; then add longitudinal and segment views.

## Extra analyses that would make this stand out

- **Effective basket cost:** fixed basket price plus mandatory checkout fees, presented for guest/member and promotion/no-promotion cases.
- **Availability-adjusted basket:** cost plus a clearly defined penalty or substitute cost for unavailable essentials; also show the raw in-stock count so the penalty is not hidden.
- **Price volatility:** daily/hourly median and range per SKU × PIN, separating fresh produce from branded packaged goods.
- **Promotion decomposition:** shelf price vs coupon/offer vs membership price vs fees, with the eligibility conditions recorded.
- **KVI and assortment map:** identify high-frequency known-value items separately from long-tail household items, using an explicit basket source rather than intuition.
- **Store-catchment comparison:** several PINs within each metro and platform-assigned fulfillment center, with matched neighborhood types.
- **Brand digital-shelf view:** exact-SKU availability, pack architecture, price index, discount and OOS exposure by app, while marking marketplace seller where relevant.
- **Confidence and evidence grades:** exact SKU/high-confidence; equivalent variant/medium; inferred quantity/low; failed capture/unknown.
- **Research watchlist:** dated metrics with primary-source links, definitions, and updates, alongside both growth and unit-economics risks.
- **Consumer and worker lens:** transparent fees and price reductions, dark-pattern rules, delivery promises, and safety/working-conditions reporting. The Government of India announced 2026 amendments to e-commerce rules with effect from 1 January 2027; this could be a dated regulatory watch item, not legal advice. [PIB announcement, 10 September 2026](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=294532)

## Bottom line

Keep the design system and the ambition. Recast the deliverable as a transparent pilot study, correct material factual errors, and redesign the comparison so sample coverage and basket completeness are visible next to price. Until then, the page is persuasive enough to be mistaken for stronger evidence than it is. The most important improvement is not more metrics or more polish: it is making every headline answerable to a well-defined, reproducible observation.
