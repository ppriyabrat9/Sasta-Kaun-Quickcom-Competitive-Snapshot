(() => {
const D = window.QCI;
const P = D.platforms, PINS = D.pins, ITEMS = D.items;
const PM = Object.fromEntries(P.map(p => [p.id, p])), IM = Object.fromEntries(ITEMS.map(i => [i.id, i])), CM = Object.fromEntries(PINS.map(c => [c.id, c]));
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const rs = n => '₹' + (n >= 100 ? Math.round(n).toLocaleString('en-IN') : n.toFixed(n < 10 ? 1 : 0));
const UL = {kg: '/kg', l: '/L', '100g': '/100 g', pc: '/egg'};
const pay = v => (100 + v).toFixed(1);            // what you pay per ₹100 at Market Rate
const payTxt = v => `₹${pay(v)}`;

/* ---------- images ---------- */
const LOGO = p => `assets/logos/${p.id}.${['blinkit', 'zepto'].includes(p.id) ? 'svg' : 'png'}`;
const logo = (p, cls = '') => `<span class="lg ${cls}"><img src="${LOGO(p)}" alt="${esc(p.name)}" onerror="this.replaceWith(Object.assign(document.createElement('b'),{textContent:'${esc(p.name)}'}))"></span>`;
const LOCAL = {potato: 'assets/img/potato.jpg', tomato: 'assets/img/tomato.png'};
const prodSrc = id => [LOCAL[id] || `assets/img/${id}.jpg`, D.img && D.img[id] ? `https://m.media-amazon.com/images/I/${D.img[id]}._SL400_.jpg` : null, `assets/icons/${IM[id].icon}.png`].filter(Boolean);
window.__nx = img => { const l = JSON.parse(img.dataset.s), i = +img.dataset.i + 1; if (i < l.length) { img.dataset.i = i; img.src = l[i]; } else img.remove(); };
const pimg = (id, cls = '') => { const l = prodSrc(id); return `<img ${cls ? `class="${cls}"` : ''} alt="${esc(IM[id].name)}" loading="lazy" src="${l[0]}" data-i="0" data-s='${JSON.stringify(l)}' onerror="__nx(this)">`; };

/* ---------- data model ---------- */
const good = o => o.st === 'ok' && o.up && !(o.fl || []).includes('pack≠std');
const obsBy = {}; D.obs.forEach(o => { obsBy[o.p + '|' + o.c + '|' + o.i] = o; });
const served = (p, c) => D.obs.some(o => o.p === p && o.c === c && o.st !== 'ns' && o.st !== 'blk');
const blocked = (p, c) => D.obs.some(o => o.p === p && o.c === c && o.st === 'blk');
const gone = (p, c) => blocked(p, c) ? 'not available*' : 'not servicing';
const cells = {}; D.obs.filter(good).forEach(o => { (cells[o.c + '|' + o.i] ||= {})[o.p] = o.up; });
const cellList = Object.entries(cells).map(([k, m]) => { const [c, i] = k.split('|'); return {c, i, m, n: Object.keys(m).length}; });
function relIndex(f = () => true) {
  const r = {}; P.forEach(p => r[p.id] = []);
  cellList.filter(x => x.n >= 3 && f(x)).forEach(x => { const md = med(Object.values(x.m)); for (const [p, v] of Object.entries(x.m)) r[p].push(Math.log(v / md)); });
  const o = {}; for (const [p, a] of Object.entries(r)) o[p] = a.length ? {v: (Math.exp(mean(a)) - 1) * 100, n: a.length} : null; return o;
}
const ALL = relIndex(), FRESH = relIndex(x => IM[x.i].cat === 'Fresh'), PACK = relIndex(x => IM[x.i].cat !== 'Fresh');
const cityIdx = Object.fromEntries(PINS.map(c => [c.id, relIndex(x => x.c === c.id)]));
const ST = Object.fromEntries(P.map(p => { let a = 0, b = 0, cities = 0; PINS.forEach(c => { if (!served(p.id, c.id)) return; cities++; ITEMS.forEach(i => { const o = obsBy[p.id + '|' + c.id + '|' + i.id]; b++; if (o && o.st === 'ok') a++; }); }); return [p.id, {pct: b ? a / b * 100 : 0, cities}]; }));
const wins = {}; let wn = 0; cellList.filter(x => x.n >= 3).forEach(x => { wn++; const w = Object.entries(x.m).sort((a, b) => a[1] - b[1])[0][0]; wins[w] = (wins[w] || 0) + 1; });
const spreadOf = f => med(cellList.filter(x => x.n >= 3 && f(x)).map(x => { const v = Object.values(x.m); return (Math.max(...v) / Math.min(...v) - 1) * 100; }));
const GAP_F = spreadOf(x => IM[x.i].cat === 'Fresh'), GAP_P = spreadOf(x => IM[x.i].cat !== 'Fresh'), GAP_ALL = spreadOf(() => true);
const citySpread = med(ITEMS.map(i => { const m = PINS.map(c => cells[c.id + '|' + i.id]).filter(x => x && Object.keys(x).length >= 3).map(x => med(Object.values(x))); return m.length >= 5 ? (Math.max(...m) / Math.min(...m) - 1) * 100 : null; }).filter(v => v != null));
const typical = id => { const v = PINS.map(c => cells[c.id + '|' + id]).filter(Boolean).flatMap(Object.values); return v.length ? med(v) : null; };
const ranked = P.filter(p => ALL[p.id]).sort((a, b) => ALL[a.id].v - ALL[b.id].v);
const full = ranked.filter(p => ST[p.id].pct >= 90 && ST[p.id].cities === PINS.length);
const champ = full[0], dear = full[full.length - 1];
const cheaperThin = ranked.filter(p => champ && p.id !== champ.id && ALL[p.id].v <= ALL[champ.id].v + 0.1);
const byStock = [...P].filter(p => ST[p.id].cities >= 5).sort((a, b) => ST[b.id].pct - ST[a.id].pct);
const topWin = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];
const obsCount = D.obs.filter(o => o.st === 'ok' || o.st === 'oos').length;
const cityNote = (p, c) => { const m = D.meta?.[p]?.[c]; return m && m.pin && m.pin !== CM[c].pin ? m.pin : null; };

/* ---------- hero ---------- */
document.querySelectorAll('[data-k=date]').forEach(e => e.textContent = D.captured.date);
document.querySelectorAll('[data-k=window]').forEach(e => e.textContent = D.captured.window);
$('#stickers').innerHTML = [[ITEMS.length, 'items', '-3deg'], [P.length, 'apps', '2deg'], [PINS.length, 'cities', '-1deg'], [obsCount.toLocaleString('en-IN'), 'prices checked', '3deg']]
  .map(([b, s, r]) => `<div class="stk" style="--r:${r}">${b}<small>${s}</small></div>`).join('');
const cart = c => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.2" fill="none" stroke="#141210" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 8h13l-1.8 6H8.4z" fill="${c}"/><circle cx="10" cy="20" r="1.8" fill="#141210"/><circle cx="17" cy="20" r="1.8" fill="#141210"/></svg>`;
const lo = ALL[ranked[0].id].v, hi = ALL[ranked[ranked.length - 1].id].v;
$('#race').innerHTML = `<h3>The Cart Race</h3><p class="rs">What each app charges for groceries worth <b>₹100 at Market Rate</b>. Cheapest crosses the line first.</p>
 ${ranked.map((p, k) => `<div class="lane">${logo(p)}<div class="track"><div class="kart ${k === 0 ? 'win' : ''}" data-to="${(4 + 70 * (hi - ALL[p.id].v) / Math.max(.1, hi - lo)).toFixed(1)}">${cart(p.color)}<b>${payTxt(ALL[p.id].v)}</b></div></div></div>`).join('')}
 <p class="rn">All cities combined. ${ranked.filter(p => ST[p.id].cities < PINS.length).map(p => `${esc(p.name)}: ${ST[p.id].cities} cities`).join(' · ')}.</p>`;
requestAnimationFrame(() => setTimeout(() => document.querySelectorAll('.kart').forEach(k => k.style.left = k.dataset.to + '%'), 250));
const belt = ITEMS.map(i => { const t = typical(i.id); return `<div class="bi">${pimg(i.id)}<div><b>${esc(i.local)}</b><span>${t ? rs(t) + UL[i.unit] : ''}</span></div></div>`; }).join('');
$('#belt').innerHTML = belt + belt;

/* ---------- Market Rate explainer ---------- */
(() => {
  const pick = ['MUM', 'BLR', 'DEL'].map(c => ({c, m: cells[c + '|onion']})).filter(x => x.m).sort((a, b) => Object.keys(b.m).length - Object.keys(a.m).length)[0];
  const arr = Object.entries(pick.m).sort((a, b) => a[1] - b[1]); const md = med(arr.map(x => x[1]));
  const n = arr.length, midIdx = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
  $('#mrate').innerHTML = `<div><h3>How to read the numbers</h3><p>For each item in each city, Market Rate is the <b>middle price</b> across the apps that sell it. Every score here reads as <b>"what you pay for groceries worth ₹100 at Market Rate"</b>. Under ₹100 is cheaper, over ₹100 is more expensive.</p></div>
   <div class="ex">${arr.map(([p, v], k) => `<div class="tag ${midIdx.includes(k) ? 'mid' : ''}"><small>${esc(PM[p].name)}</small>${rs(v)}</div>`).join('')}
   <div class="note">Onion in ${esc(CM[pick.c].city)}, per kg → Market Rate ${rs(md)}. An app at ${rs(md * 1.05)} scores ₹105.</div></div>`;
})();

/* ---------- key insights (one stat, one meaning) ---------- */
const jm = PM.jiomart, bk = PM.blinkit, amz = PM.amazon, fk = PM.flipkart;
const idrApps = P.filter(p => served(p.id, 'IDR')).length;
const cheapest = ranked[0], priciest = ranked[ranked.length - 1];
const hookNames = P.filter(p => p.id !== 'jiomart' && FRESH[p.id] && PACK[p.id] && FRESH[p.id].v < -3 && PACK[p.id].v > -0.5).map(p => p.name);
const V = [
  {img: 'tomato', big: `${Math.round(GAP_F)}% vs ${Math.round(GAP_P)}%`, h: 'Price gap between apps: vegetables vs branded packs',
   so: `Apps compete on sabzi, not on brands. The printed MRP keeps branded prices almost the same everywhere.`},
  {img: 'ghee', big: payTxt(ALL[priciest.id].v), h: `${priciest.name}, the biggest app, is also the most expensive`,
   so: `Shoppers pay for speed and a reliable shelf. The market leader does not need to be the cheapest.`},
  {img: 'milk', big: `${Math.round(ST[jm.id].pct)}%`, h: `${jm.name} has the lowest prices, but only this much of the list in stock`,
   so: `A missing item sends the shopper to another app. Availability matters more than price.`},
  {img: 'onion', big: payTxt(ALL[champ.id].v), h: `${champ.name}: below the typical price, with almost everything in stock in every city`,
   so: `The only app that is both cheap and reliable everywhere. That is its edge over the leader.`},
  {img: 'carrot', big: 'Cheap sabzi', h: `${hookNames.join(' and ')} price vegetables well below the rest`,
   so: `New players use cheap everyday vegetables to look cheap and win users fast, while keeping branded prices normal.`},
  {img: 'atta', big: `${Math.round(citySpread)}%`, h: 'Price swing for the same item across cities',
   so: `There is no single cheapest app in India. Winners change city to city, and smaller cities like Indore still have gaps.`}
];
$('#verdicts').innerHTML = V.map((v, k) => `<article class="vd"><span class="no">#${k + 1}</span>${pimg(v.img, 'pic')}<div class="big">${esc(v.big)}</div><h3>${esc(v.h)}</h3><div class="so"><b>so what?</b>${esc(v.so)}</div></article>`).join('');

/* ---------- QC 101 ---------- */
$('#qcStats').innerHTML = [['$13–14B', 'spent on quick commerce in FY26, about 70% of India\'s online grocery'], ['~6,300', 'dark stores serving 7.8M orders a day'], ['85–90%', 'of quick commerce sales are still household essentials'], ['~80%', 'of quick commerce sales come from the big metros']]
  .map(([b, s]) => `<div class="qs"><b>${b}</b><span>${s}</span></div>`).join('');



/* ---------- strategy matrix ---------- */
const QUAD = {
  hook: {n: 'Sabzi hook', d: 'Cheap vegetables to pull you in, normal pack prices to protect margin. The fastest way to look cheap.'},
  prem: {n: 'Premium convenience', d: 'A little more expensive on everything. Wins on speed, range and habit, as long as the shelf stays full.'},
  edlp: {n: 'Everyday low price', d: 'A little cheaper on almost everything. Harder to notice, harder to copy, costs margin on every order.'},
  pack: {n: 'Pack deals', d: 'Sharp on branded packs, pricey on sabzi. Strong for brand-led baskets, weak on the daily vegetable run.'}
};
const quadOf = p => { const x = FRESH[p.id]?.v ?? 0, y = PACK[p.id]?.v ?? 0; return x < 0 ? (y > 0 ? 'hook' : 'edlp') : (y > 0 ? 'prem' : 'pack'); };
(() => {
  const XR = 12, YR = 3.5; const pos = v => Math.max(6, Math.min(94, v));
  $('#matrix').innerHTML = `<div class="quad q1">${QUAD.hook.n}<small>cheap sabzi · pricey packs</small></div><div class="quad q2">${QUAD.prem.n}<small>pricey sabzi · pricey packs</small></div><div class="quad q3">${QUAD.edlp.n}<small>cheap sabzi · cheap packs</small></div><div class="quad q4">${QUAD.pack.n}<small>pricey sabzi · cheap packs</small></div>
  <div class="axis ax-x"></div><div class="axis ax-y"></div>
  <span class="axl" style="left:8px;top:calc(50% + 6px)">← cheaper sabzi</span><span class="axl" style="right:8px;top:calc(50% + 6px)">pricier sabzi →</span>
  ${(() => { const pl = []; return P.filter(p => FRESH[p.id] && PACK[p.id]).map(p => { const L = pos(50 + FRESH[p.id].v / XR * 44); let T = pos(50 - PACK[p.id].v / YR * 44); while (pl.some(q => Math.abs(q[0] - L) < 30 && Math.abs(q[1] - T) < 7)) T += 7; pl.push([L, T]); return {p, L, T}; }); })().map(({p, L, T}) => `<div class="dot" style="left:${L}%;top:${T}%">${logo(p)}<small>${pay(FRESH[p.id].v)} / ${pay(PACK[p.id].v)}${ST[p.id].cities < 5 ? ' · ' + ST[p.id].cities + ' cities' : ''}</small></div>`).join('')}`;
  const g = {}; P.forEach(p => { if (FRESH[p.id] && PACK[p.id]) (g[quadOf(p)] ||= []).push(p); });
  $('#plays').innerHTML = ['hook', 'edlp', 'pack', 'prem'].filter(k => g[k]).map(k => `<div class="play"><h3>${QUAD[k].n} <span class="lgs">${g[k].map(p => `<img src="${LOGO(p)}" alt="${esc(p.name)}">`).join('')}</span></h3><p>${QUAD[k].d}</p></div>`).join('')
   + `<p class="note">Numbers on each logo: sabzi / packs, per ₹100 at Market Rate.</p>`;
})();

/* ---------- basket ---------- */
const qtyOf = i => i.unit === 'pc' ? i.std : i.unit === '100g' ? i.std / 100 : i.std / 1000;
function basket(c) {
  const apps = P.filter(p => served(p.id, c));
  const cover = p => ITEMS.filter(i => { const o = obsBy[p.id + '|' + c + '|' + i.id]; return o && good(o); }).length;
  const inb = apps.filter(p => cover(p) >= ITEMS.length * 0.6), out = apps.filter(p => !inb.includes(p));
  const common = ITEMS.filter(i => inb.every(p => { const o = obsBy[p.id + '|' + c + '|' + i.id]; return o && good(o); }));
  const tot = inb.map(p => ({p, t: common.reduce((s, i) => s + obsBy[p.id + '|' + c + '|' + i.id].up * qtyOf(i), 0)})).sort((a, b) => a.t - b.t);
  return {inb, out, common, tot, cover, missing: P.filter(p => !served(p.id, c))};
}
let city = 'MUM';
$('#cityChips').innerHTML = PINS.map(c => `<button class="chip" role="tab" data-c="${c.id}" aria-selected="${c.id === city}">${esc(c.city)}</button>`).join('');
$('#cityChips').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; city = b.dataset.c; document.querySelectorAll('#cityChips .chip').forEach(x => x.setAttribute('aria-selected', x === b)); renderBasket(); };
function renderBasket() {
  const B = basket(city), c = CM[city];
  if (B.tot.length < 2 || B.common.length < 5) { $('#basketBox').innerHTML = `<div class="card bk">Too few shared items in ${esc(c.city)} to compare fairly.</div>`; return; }
  const min = B.tot[0].t, max = B.tot[B.tot.length - 1].t;
  const alt = P.map(p => cityNote(p.id, city) ? `${p.name} priced at nearby PIN ${cityNote(p.id, city)} (it doesn't serve ${c.pin})` : null).filter(Boolean);
  $('#basketBox').innerHTML = `<div class="card bk"><p class="kicker">${esc(c.city)} · PIN ${c.pin} · ${esc(c.area)}</p>
   <p class="bk-big">${esc(B.tot[0].p.name)} fills this bag for ${rs(max - min)} less than ${esc(B.tot[B.tot.length - 1].p.name)}.</p>
   <p>${B.common.length} items every compared app had in stock here, in normal household packs.</p>
   <div class="bk-list">${B.common.map(i => `<span>${pimg(i.id)}${esc(i.local)}</span>`).join('')}</div>
   ${B.out.length ? `<p class="note">Left out (fewer than 17 of 28 items here): ${B.out.map(p => `${esc(p.name)} ${B.cover(p)}/28`).join(', ')}.</p>` : ''}
   ${B.missing.length ? `<p class="note">${B.missing.map(p => `${esc(p.name)}: ${blocked(p.id, city) ? 'not available*' : 'currently not servicing this city'}`).join(' · ')}</p>` : ''}
   ${alt.length ? `<p class="note">${alt.join('. ')}.</p>` : ''}</div>
   <div class="card bk">${[...B.tot].reverse().map(x => `<div class="bk-row">${logo(x.p)}<span class="t"><i style="--c:${x.p.color};width:${(x.t / (max * 1.12) * 100).toFixed(1)}%"></i></span><b>${rs(x.t)}</b></div>`).join('')}
   <p class="note">Most expensive at the top. Bars are drawn to scale.</p></div>`;
}
renderBasket();

/* ---------- shelf ---------- */
const cats = ['All', ...new Set(ITEMS.map(i => i.cat))]; let cat = 'All', scity = 'ALL';
$('#catChips').innerHTML = cats.map(c => `<button class="chip ${c === cat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('');
$('#catChips').onclick = e => { const b = e.target.closest('[data-cat]'); if (!b) return; cat = b.dataset.cat; document.querySelectorAll('#catChips .chip').forEach(x => x.classList.toggle('on', x === b)); renderShelf(); };
$('#shelfCity').innerHTML = `<option value="ALL">All cities (typical)</option>` + PINS.map(c => `<option value="${c.id}">${esc(c.city)}</option>`).join('');
$('#shelfCity').onchange = e => { scity = e.target.value; renderShelf(); };
function appPrice(p, i) {
  if (scity !== 'ALL') { if (!served(p, scity)) return {na: blocked(p, scity) ? 'not available*' : 'not servicing'}; const o = obsBy[p + '|' + scity + '|' + i]; if (o && good(o)) return {v: o.up}; if (o && o.st === 'oos') return {na: 'out of stock'}; return {na: 'not available'}; }
  const v = PINS.map(c => obsBy[p + '|' + c.id + '|' + i]).filter(o => o && good(o)).map(o => o.up); return v.length ? {v: med(v)} : {na: 'not available'};
}
function renderShelf() {
  $('#shelfGrid').innerHTML = ITEMS.filter(i => cat === 'All' || i.cat === cat).map(i => {
    const rows = P.map(p => ({p, ...appPrice(p.id, i.id)})); const vals = rows.filter(r => r.v).map(r => r.v); const mn = Math.min(...vals), mx = Math.max(...vals);
    rows.sort((a, b) => (a.v ?? 1e9) - (b.v ?? 1e9));
    return `<article class="pc" tabindex="0" role="button" data-i="${i.id}" aria-label="${esc(i.name)}: see every city"><div class="ph">${vals.length > 1 ? `<span class="spread">+${Math.round((mx / mn - 1) * 100)}% gap</span>` : ''}${pimg(i.id)}</div>
     <div class="bd"><h3>${esc(i.name)}<small>${esc(i.local)} · ${esc(i.spec)}</small></h3>
     <div class="prices">${rows.map(r => `<div class="pr ${r.v === mn && vals.length > 1 ? 'best' : ''} ${r.v ? '' : 'na'}">${logo(r.p)}<b>${r.v ? rs(r.v) + UL[i.unit] : r.na}</b></div>`).join('')}</div></div></article>`; }).join('');
}
renderShelf();
$('#shelfGrid').addEventListener('click', e => { const c = e.target.closest('.pc'); if (c) openItem(c.dataset.i); });
$('#shelfGrid').addEventListener('keydown', e => { const c = e.target.closest('.pc'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openItem(c.dataset.i); } });

/* ---------- modal ---------- */
let lastFocus;
function openItem(id) {
  const i = IM[id]; lastFocus = document.activeElement;
  const head = `<tr><th>City</th>${P.map(p => `<th>${esc(p.name)}</th>`).join('')}</tr>`;
  const body = PINS.map(c => { const m = cells[c.id + '|' + id] || {}; const mn = Math.min(...Object.values(m));
    return `<tr><th>${esc(c.city)}</th>${P.map(p => { if (!served(p.id, c.id)) return `<td class="ns">${gone(p.id, c.id)}</td>`; const o = obsBy[p.id + '|' + c.id + '|' + id];
      if (o && good(o)) return `<td class="${o.up === mn && Object.keys(m).length > 1 ? 'best' : ''}">${rs(o.up)}<small>${esc(o.n)} · ${esc(o.pk)} · ${rs(o.sp)}</small></td>`;
      if (o && o.st === 'oos') return `<td>out of stock<small>${esc(o.n || '')}</small></td>`;
      if (o && o.st === 'ok') return `<td>${rs(o.sp)}<small>${esc(o.n)} · ${esc(o.pk)} (different pack size, not compared)</small></td>`;
      return `<td>not available</td>`; }).join('')}</tr>`; }).join('');
  $('#mBody').innerHTML = `<div class="m-head">${pimg(id)}<div><p class="kicker">${esc(i.cat)} · price ${UL[i.unit]}</p><h3 id="mTitle">${esc(i.name)} (${esc(i.local)})</h3><p>${esc(i.spec)}</p></div></div>
   <div class="tbl card"><table class="mt"><thead>${head}</thead><tbody>${body}</tbody></table></div><p class="note">Green = cheapest in that city. Small text = the exact listing, pack and shelf price recorded.</p>`;
  $('#modal').hidden = false; $('#mClose').focus();
}
const closeM = () => { $('#modal').hidden = true; lastFocus && lastFocus.focus(); };
$('#mClose').onclick = closeM; $('#modal').onclick = e => { if (e.target.id === 'modal') closeM(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closeM(); });

/* ---------- heatmap ---------- */
const hcol = v => { const a = Math.min(1, Math.abs(v) / 8); return v < 0 ? `rgba(18,161,80,${.15 + a * .7})` : `rgba(242,49,127,${.12 + a * .7})`; };
$('#heat').innerHTML = `<thead><tr><th>App</th>${PINS.map(c => `<th>${esc(c.city)}</th>`).join('')}</tr></thead><tbody>` + ranked.map(p => `<tr><th>${logo(p)}</th>${PINS.map(c => {
  if (!served(p.id, c.id)) return `<td class="ns">${gone(p.id, c.id)}</td>`; const x = cityIdx[c.id][p.id]; if (!x) return `<td class="ns">too few items</td>`;
  return `<td style="background:${hcol(x.v)};color:${Math.abs(x.v) > 5 ? '#fff' : 'inherit'}" title="${esc(p.name)}, ${esc(c.city)}: ${payTxt(x.v)} per ₹100 (${x.n} items)">${pay(x.v)}${cityNote(p.id, c.id) ? '†' : ''}</td>`; }).join('')}</tr>`).join('') + '</tbody>';

/* ---------- so what ---------- */
const hookList = P.filter(p => FRESH[p.id] && PACK[p.id] && quadOf(p) === 'hook').map(p => p.name); const hookApps = hookList.length > 1 ? hookList.slice(0, -1).join(', ') + ' and ' + hookList[hookList.length - 1] : hookList.join('');
const SWP = [
  `Win on vegetables. Shoppers notice a ${Math.round(GAP_F)}% gap on sabzi, so keep aloo, pyaaz and tamatar sharp every day.`,
  `Don't cut branded pack prices. The gap is already small (${Math.round(GAP_P)}%), so the money is better spent elsewhere.`,
  `Fix stock before price. An empty shelf sends the shopper to a rival app, whatever the price.`,
  `Set prices city by city. The same item swings ${Math.round(citySpread)}% between cities.`,
  `Go where rivals are missing. Indore has no Amazon Now yet; tier-2 cities are open ground.`,
  `A premium only works with a full shelf. Charge more only where you are the most reliable app.`
];
$('#sowhatGrid').innerHTML = `<div class="sw sw-p"><span class="who">For platforms</span><ul>${SWP.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`
 + [['Brands', [`MRP fixes your price. Track stock in every city's dark stores.`, `Pay for visibility where your shoppers are, not everywhere.`]],
    ['Shoppers', [`Compare apps for vegetables, not for branded packs.`, `Pick the app that has your whole list.`]]]
   .map(([w, l]) => `<div class="sw"><span class="who">For ${w}</span><ul>${l.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('')
 + `<p class="nexttest">Next to test: do cheaper vegetables bring shoppers back more often, and how do delivery fees change the ranking at checkout?</p>`;

/* ---------- method ---------- */
$('#methodBox').innerHTML = `<div class="card"><h3>How</h3><ul>
 <li>One well-known PIN per city; each app's public website set to that PIN.</li>
 <li>Same 28 items; same brand where brand matters (Amul, Aashirvaad, Tata). Pack closest to normal household size, converted to per kg / L / 100 g / egg.</li>
 <li>Market Rate = middle price among apps selling that item in that city. Only items at least 3 apps sold count.</li>
 <li>Shelf price only: no login, coupons, fees or memberships. ${esc(D.captured.window)}.</li></ul></div>
 <div class="card"><h3>Limits</h3><ul>
 <li>A one-evening snapshot, not a tracker. Fresh prices and stock change through the day.</li>
 <li>One PIN stands in for a city; another neighbourhood can get a different store.</li>
 <li>Amazon Now: Mumbai and Kolkata priced at the nearest served PIN (400016, 700020)†. Indore: currently not servicing (15 PINs tried).</li>
 <li>Every item first marked not available or out of stock was searched again on 1 Oct; anything found in stock was added. What's still missing was missing twice.</li>
 <li>Flipkart Minutes: 7 cities were captured on 1 Oct, after signing in (the guest website would not hold a delivery location).</li></ul></div>`;
$('#cov').innerHTML = `<thead><tr><th>App</th>${PINS.map(c => `<th>${esc(c.city)}<br><small>${c.pin}</small></th>`).join('')}</tr></thead><tbody>` + P.map(p => `<tr><th>${logo(p)}</th>${PINS.map(c => {
  if (!served(p.id, c.id)) return `<td class="ns">${gone(p.id, c.id)}</td>`; const n = ITEMS.filter(i => { const o = obsBy[p.id + '|' + c.id + '|' + i.id]; return o && o.st === 'ok'; }).length; return `<td class="y">${n}/28${cityNote(p.id, c.id) ? '†' : ''}</td>`; }).join('')}</tr>`).join('') + '</tbody>';

/* nav highlight */
const links = [...document.querySelectorAll('.nav nav a')];
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), {rootMargin: '-40% 0px -55% 0px'});
document.querySelectorAll('main section[id]').forEach(s => io.observe(s));
})();
