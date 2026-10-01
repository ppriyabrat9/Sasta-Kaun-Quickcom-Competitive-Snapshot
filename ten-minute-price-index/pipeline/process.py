"""Normalise, validate and aggregate raw quick-commerce price captures into site/data.js"""
import json, re, math, os, glob, statistics as st

RAW = './raw'
OUT = '../data.js'

PINS = [
 dict(id='BLR',pin='560034',area='Koramangala',city='Bengaluru'),
 dict(id='MUM',pin='400050',area='Bandra West',city='Mumbai'),
 dict(id='DEL',pin='110017',area='Malviya Nagar',city='New Delhi'),
 dict(id='GGN',pin='122002',area='DLF Phase 3',city='Gurugram'),
 dict(id='PUN',pin='411038',area='Kothrud',city='Pune'),
 dict(id='HYD',pin='500081',area='Madhapur',city='Hyderabad'),
 dict(id='CHE',pin='600020',area='Adyar',city='Chennai'),
 dict(id='KOL',pin='700019',area='Ballygunge',city='Kolkata'),
 dict(id='LKO',pin='226010',area='Gomti Nagar',city='Lucknow'),
 dict(id='IDR',pin='452010',area='Vijay Nagar',city='Indore'),
]

# id, display, hindi, category, unit, standard basket qty (in base units g/ml/pcs), icon, spec
ITEMS = [
 ('potato','Potato','Aloo','Fresh','kg',1000,'potato','Loose/regular potato, ~1 kg pack'),
 ('onion','Onion','Pyaaz','Fresh','kg',1000,'onion','Regular red onion, ~1 kg pack'),
 ('tomato','Tomato','Tamatar','Fresh','kg',1000,'tomato','Hybrid / desi tomato, ~500 g pack'),
 ('chilli','Green Chilli','Hari Mirch','Fresh','kg',100,'hot_pepper','Green chilli, ~100 g pack'),
 ('ginger','Ginger','Adrak','Fresh','kg',200,'ginger_root','Ginger, ~200 g pack'),
 ('garlic','Garlic','Lehsun','Fresh','kg',200,'garlic','Whole garlic, ~200 g pack'),
 ('coriander','Coriander','Dhaniya','Fresh','kg',100,'herb','Coriander leaves, ~100 g / 1 bunch'),
 ('bhindi','Lady Finger','Bhindi','Fresh','kg',500,'pea_pod','Lady finger / okra, ~500 g'),
 ('carrot','Carrot','Gajar','Fresh','kg',500,'carrot','Carrot (orange/Ooty), ~500 g'),
 ('milk','Amul Taaza Toned Milk','Doodh','Dairy','l',1000,'glass_of_milk','Amul Taaza toned milk, 500 ml pouch'),
 ('butter','Amul Butter','Makhan','Dairy','100g',100,'butter','Amul pasteurised salted butter, 100 g'),
 ('paneer','Amul Fresh Paneer','Paneer','Dairy','kg',200,'cheese_wedge','Amul fresh/malai paneer, 200 g'),
 ('curd','Amul Masti Dahi','Dahi','Dairy','kg',400,'bowl_with_spoon','Amul Masti curd, 380–500 g'),
 ('eggs','White Eggs','Ande','Dairy','pc',6,'egg','Regular white eggs, per egg (6-pack preferred)'),
 ('atta','Aashirvaad Atta','Atta','Staples','kg',5000,'flatbread','Aashirvaad Shudh/Superior MP chakki atta, 5 kg'),
 ('rice','India Gate Rozzana Basmati','Chawal','Staples','kg',1000,'cooked_rice','India Gate Feast Rozzana basmati, 1 kg'),
 ('dal','Tata Sampann Toor Dal','Arhar Dal','Staples','kg',1000,'pot_of_food','Tata Sampann unpolished toor dal, 1 kg'),
 ('sugar','Sugar','Cheeni','Staples','kg',1000,'ice','Refined white sugar, 1 kg (any brand)'),
 ('salt','Tata Salt','Namak','Staples','kg',1000,'salt','Tata Salt vacuum evaporated iodised, 1 kg'),
 ('oil','Fortune Sunflower Oil','Tel','Staples','l',1000,'sunflower','Fortune Sunlite refined sunflower oil, 1 L pouch'),
 ('ghee','Amul Ghee','Ghee','Staples','l',1000,'honey_pot','Amul pure/cow ghee, 1 L'),
 ('tea','Tata Tea Premium','Chai Patti','Staples','100g',250,'teacup_without_handle','Tata Tea Premium, 250 g'),
 ('turmeric','Everest Turmeric','Haldi','Staples','100g',100,'jar','Everest turmeric powder, 100 g'),
 ('maggi','Maggi Masala Noodles','Maggi','Packaged','100g',280,'steaming_bowl','Maggi 2-minute masala, 4-pack (280 g)'),
 ('parleg','Parle-G','Biscuit','Packaged','100g',250,'cookie','Parle-G original glucose, 250 g'),
 ('detergent','Surf Excel Easy Wash','Detergent','Home care','kg',1000,'bubbles','Surf Excel Easy Wash powder, 1 kg'),
 ('vim','Vim Bar','Bartan Sabun','Home care','100g',300,'sponge','Vim dishwash bar, ~300 g'),
 ('toothpaste','Colgate Strong Teeth','Toothpaste','Home care','100g',200,'toothbrush','Colgate Strong Teeth, 200 g'),
]
IT = {i[0]: i for i in ITEMS}

# hard validation: a pick is rejected if its name matches these (defence in depth over the in-browser matcher)
REJECT = {
 'butter': r'school|cooking',
 'potato': r'stix|cracker|cream|chips|sugar|mccain|bites',
 'onion': r'sausage|munch|corn|cream|chips',
 'curd': r'tikki|treats',
 'tomato': r'makhana|disc|peppy|ketchup|sauce|madness|angles|bingo',
 'carrot': r'spread|sandwich|cucumber|veeba|chopped',
 'garlic': r'granule|melt|cheesy|crunchy|noodle|kulcha|popper|sev|mixture|nugget|shots|potato|chips|bread|ching|maggi|laddoo|khakhra|pizza',
 'ghee': r'laddoo|laddu|besan|motichoor|jamun|sweet|biscuit|cookie',
 'salt': r'pistachio|cashew|nut|peanut|chips|sampann',
 'sugar': r'chikki|bites|peanut|coffee|karam|potato|low sugar|muesli|kellogg',
 'maggi': r'tandoori|thums|combo|\+|spicy|garlic',
 'vim': r'multipack',
 'eggs': r'vitad|kids|speciality|protien|protein|max|immunity|nutri\+|vit d|nesting|little|tray|polyset',
 'atta': r'lokwan|premium blend|select|multigrain|fibre|sehori',
 'rice': r'choice',
 'parleg': r'royale|oats|berries|milk shakti',
 'bhindi': r'diced|baby',
 'milk': r'chai|mazza|homogeni[sz]ed',
 'ginger': r'grind|dishwash|bar|soap|exo|sauce|kombucha|sushi|slice|chopped',
 'coriander': r'sabut|vedaka|good life|chukde|powder|seed',
 'tea': r'gold|agni|anokha',
 'oil': r'rice bran|mustard',
}
PACK_REJECT = r'combo'

UNIT = {'kg':1000,'g':1,'gm':1,'gms':1,'gram':1,'grams':1,'gr':1,'ml':1,'l':1000,'ltr':1000,'litre':1000,'liter':1000,'litres':1000,'liters':1000,'lt':1000,'ltrs':1000}

def u(x):
    x = x.lower()
    return UNIT.get(x, UNIT.get(x.rstrip('s'), 1))

def parse_qty(s):
    s = ' ' + (s or '').lower().replace(',', '') + ' '
    U = r'(kg|gms?|grams?|gr|g|ml|ltrs?|litres?|liters?|lt|l)'
    qty = pcs = None
    m0 = re.search(r'(\d+)\s*pcs?\s*,?\s*(\d+(?:\.\d+)?)\s*(g|ml)\s*each', s)
    if m0: return float(m0.group(1))*float(m0.group(2)), None
    m = re.search(r'(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*' + U + r'\b', s)
    if m: qty = int(m.group(1)) * float(m.group(2)) * u(m.group(3))
    else:
        m = re.search(r'(\d+(?:\.\d+)?)\s*' + U + r'\s*[x×]\s*(\d+)\b', s)
        if m: qty = float(m.group(1)) * int(m.group(3)) * u(m.group(2))
        else:
            m = re.search(r'(\d+(?:\.\d+)?)\s*' + U + r'?\s*(?:-|to|–)\s*(\d+(?:\.\d+)?)\s*' + U + r'\b', s)
            if m:
                u2 = u(m.group(4)); u1 = u(m.group(2)) if m.group(2) else u2
                qty = (float(m.group(1)) * u1 + float(m.group(3)) * u2) / 2
            else:
                m = re.search(r'(\d+(?:\.\d+)?)\s*' + U + r'\b', s)
                if m: qty = float(m.group(1)) * u(m.group(2))
    m = re.search(r'(\d+)\s*(?:pcs?|pieces?|units?|nos?|eggs?)\b', s) or re.search(r'pack of\s*(\d+)', s)
    if m: pcs = int(m.group(1))
    return qty, pcs

def norm(item, name, pack, sp):
    """returns (base_qty, unit_price, flags)"""
    iid, _, _, _, unit, std, _, _ = IT[item]
    flags = []
    pk = pack or ''
    m = re.search(r'(\d+(?:\.\d+)?)\s*(g|ml)\s*or\s*(\d+(?:\.\d+)?)\s*(g|ml)', pk, re.I)
    if m:  # e.g. "(840 g or 910 g)": platform lists two fills; use the larger (declared) one
        pk = pk.replace(m.group(0), f"{max(float(m.group(1)), float(m.group(3))):g} {m.group(2)}"); flags.append('two fills listed')
    txt = pk + ' | ' + (name or '')
    qty, pcs = parse_qty(txt)
    if item == 'eggs':
        # "6 white eggs", "Pack of 6"
        if not pcs:
            m = re.search(r'(\d+)\s*(?:white\s*)?eggs', (name or '').lower())
            if m: pcs = int(m.group(1))
        if not pcs: return None, None, ['nopack']
        return pcs, sp / pcs, flags
    if not qty and item == 'coriander' and re.search(r'bunch', pack or '', re.I):
        nb = re.search(r'(\d+)\s*bunch', pack, re.I); mx = re.search(r'x\s*(\d+)', pack, re.I)
        qty = 100 * (int(nb.group(1)) if nb else 1) * (int(mx.group(1)) if mx else 1)
        flags.append('bunch≈100g')
    if not qty: return None, None, ['nopack']
    if unit == 'l' and re.search(r'\d\s*(g|gm|gms|kg)\b', txt, re.I) and not re.search(r'\d\s*(ml|l|ltr|litre|liter)\b', txt, re.I):
        # oil sold by weight: 1 L sunflower oil ≈ 910 g
        qty = qty / 0.91; flags.append('mass→vol')
    if item == 'vim' and '+ 30%' in (name or ''):
        qty = qty * 1.3; flags.append('+30% extra')
    if unit == '100g': up = sp / (qty / 100)
    else: up = sp / (qty / 1000)
    ratio = qty / std
    if ratio > 2.2 or ratio < 0.45: flags.append('pack≠std')
    return qty, up, flags

def load():
    obs = {}  # (plat,city,item) -> dict
    meta = {}
    for f in sorted(glob.glob(RAW + '/*.json')):
        base = os.path.basename(f)
        if base.endswith('_fix.json') or base.startswith('_'): continue
        d = json.load(open(f))
        plat = d['plat']
        meta.setdefault(plat, {})
        for city, rows in d['g'].items():
            if isinstance(rows, dict):  # {rows, eta, store, t}
                meta[plat][city] = {k: v for k, v in rows.items() if k != 'rows'}
                rows = rows['rows']
            for r in rows:
                obs[(plat, city, r[0])] = r
        fx = f.replace('.json', '_fix.json')
        if os.path.exists(fx):
            for city, rows in json.load(open(fx)).items():
                for r in rows: obs[(plat, city, r[0])] = r
    return obs, meta

def main():
    obs, meta = load()
    plats = sorted({k[0] for k in obs})
    out = []
    rejected = []
    for (plat, city, item), r in sorted(obs.items()):
        rec = dict(p=plat, c=city, i=item)
        if meta.get(plat,{}).get(city,{}).get('ns'):
            rec['st']='ns'; out.append(rec); continue
        if len(r) < 4 or r[1] in (None, ''):
            rec['st'] = 'na'; out.append(rec); continue
        _, name, pack, sp, mrp, oos = r[:6]
        rj = REJECT.get(item)
        if (rj and re.search(rj, name, re.I)) or re.search(PACK_REJECT, pack or '', re.I):
            rejected.append((plat, city, item, name, pack)); rec['st'] = 'na'; out.append(rec); continue
        if pack == '(listed, unavailable)':
            rec.update(st='oos', n=name, sp=sp); out.append(rec); continue
        qty, up, flags = norm(item, name, pack, sp)
        rec.update(n=name, pk=pack, sp=sp, mrp=mrp if mrp else sp, q=qty, up=round(up, 2) if up else None, fl=flags,
                   st='oos' if oos else 'ok')
        if up is None: rec['st'] = 'na'
        out.append(rec)
    have = {(o['p'], o['c']) for o in out}
    for pl in ['blinkit','zepto','instamart','flipkart','amazon','jiomart']:
        for pn in PINS:
            if (pl, pn['id']) not in have:
                for it in ITEMS: out.append(dict(p=pl, c=pn['id'], i=it[0], st='blk'))
    print('rejected picks:', len(rejected))
    for x in rejected: print('   ', x)
    return out, meta, plats

if __name__ == '__main__':
    out, meta, plats = main()
    print(len(out), plats)

PLATFORMS = [
 dict(id='blinkit', name='Blinkit', owner='Eternal (Zomato)', color='#F8CB46', ink='#0C831F', domain='blinkit.com', status='captured'),
 dict(id='zepto', name='Zepto', owner='Zepto', color='#7B2FF7', ink='#FF3269', domain='zeptonow.com', status='captured'),
 dict(id='instamart', name='Instamart', owner='Swiggy', color='#FC8019', ink='#FC8019', domain='swiggy.com', status='captured'),
 dict(id='flipkart', name='Flipkart Minutes', owner='Flipkart', color='#2874F0', ink='#FFE11B', domain='flipkart.com', status='captured'),
 dict(id='amazon', name='Amazon Now', owner='Amazon', color='#FF9900', ink='#232F3E', domain='amazon.in', status='captured'),
 dict(id='jiomart', name='JioMart', owner='Reliance Retail', color='#0A5CC2', ink='#E0243B', domain='jiomart.com', status='captured'),
]

def export(out, meta, plats):
    research = json.load(open('./research.json'))
    payload = dict(
        captured=dict(date='30 Sep 2026', window='30 Sep evening (6:25 to 11:30 pm IST), with every missing or out-of-stock item rechecked and Flipkart Minutes completed on 1 Oct (5 am to 3:30 pm IST)', tz='Asia/Kolkata'),
        pins=PINS,
        items=[dict(id=i[0], name=i[1], local=i[2], cat=i[3], unit=i[4], std=i[5], icon=i[6], spec=i[7]) for i in ITEMS],
        platforms=PLATFORMS,
        meta=meta,
        obs=out,
        research=research,
        img=json.load(open('./amazon_img.json')),
    )
    js = 'window.QCI = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(OUT, 'w').write(js)
    import csv
    os.makedirs('../data', exist_ok=True)
    with open('../data/prices.csv','w',newline='') as fh:
        w=csv.writer(fh); w.writerow(['platform','city','pin','item','status','product_name','pack','selling_price_inr','mrp_inr','normalised_qty','unit','unit_price_inr','flags'])
        pinmap={p['id']:p for p in PINS}
        for o in out:
            w.writerow([o['p'], pinmap[o['c']]['city'], pinmap[o['c']]['pin'], o['i'], o['st'], o.get('n',''), o.get('pk',''), o.get('sp',''), o.get('mrp',''), round(o['q'],1) if o.get('q') else '', IT[o['i']][4], o.get('up',''), ';'.join(o.get('fl',[]))])
    print('wrote', OUT, len(js))

if __name__ == '__main__' and os.path.exists('./research.json'):
    export(out, meta, plats)
