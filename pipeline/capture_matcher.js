window.QC = (function(){
const PINS = [
 {id:'BLR',pin:'560034',area:'Koramangala',city:'Bengaluru',lat:12.9352,lon:77.6245},
 {id:'MUM',pin:'400050',area:'Bandra West',city:'Mumbai',lat:19.0596,lon:72.8295},
 {id:'DEL',pin:'110017',area:'Malviya Nagar',city:'New Delhi',lat:28.5355,lon:77.2100},
 {id:'GGN',pin:'122002',area:'DLF Phase 3',city:'Gurugram',lat:28.4940,lon:77.0930},
 {id:'PUN',pin:'411038',area:'Kothrud',city:'Pune',lat:18.5074,lon:73.8077},
 {id:'HYD',pin:'500081',area:'Madhapur',city:'Hyderabad',lat:17.4483,lon:78.3915},
 {id:'CHE',pin:'600020',area:'Adyar',city:'Chennai',lat:13.0012,lon:80.2565},
 {id:'KOL',pin:'700019',area:'Ballygunge',city:'Kolkata',lat:22.5270,lon:88.3650},
 {id:'LKO',pin:'226010',area:'Gomti Nagar',city:'Lucknow',lat:26.8500,lon:80.9990},
 {id:'IDR',pin:'452010',area:'Vijay Nagar',city:'Indore',lat:22.7533,lon:75.8937}
];
const X = s => new RegExp(s,'i');
const ITEMS = [
 {id:'potato',q:'potato',must:['potato'],not:'red|ooty|chip|fries|wedge|sweet|baby|smiley|nugget|bhujia|flake|powder|masala|organic|bloom|cocktail|hash|twister|tikki|papad|starch|mash|lays|pringles|jacket|peeler',u:'kg',t:1000},
 {id:'onion',q:'onion',must:['onion'],not:'spring|sambar|small|pakoda|pakora|powder|flake|fried|paste|garlic|organic|white|bloom|ring|chip|masala|seed|shallot|pickle|salad|sauce|chutney|dip|jain|rava|dosa|uttapam|kachori|samosa|bhaji|leaves|leaf',u:'kg',t:1000},
 {id:'tomato',q:'tomato',must:['tomato'],not:'ketchup|puree|sauce|cherry|soup|paste|organic|chutney|bloom|dried|powder|pickle|chip|kissan|green|salsa|rasam|pasta|cheese|juice|onion|masala|heirloom|ooty|grape',u:'kg',t:500},
 {id:'chilli',q:'green chilli',must:['chil+i','green'],not:'sauce|pickle|powder|organic|bloom|paste|capsicum|bell|flake|dry|red|bhavnagri|jalapeno|thai|bajji|banana',u:'kg',t:100},
 {id:'ginger',q:'ginger',must:['ginger'],not:'garlic|paste|powder|tea|ale|candy|pickle|juice|shot|organic|biscuit|dry|mango|lemon|honey|chai|soda|beer|syrup|chew|oil|capsule|root powder|bloom|cookie|sonth|saunth|bread|drink|wellness|jaggery|masala',u:'kg',t:200},
 {id:'garlic',q:'garlic',must:['garlic'],not:'ginger|paste|powder|bread|sauce|mayo|pickle|peeled|organic|chutney|flake|chip|oil|pepper|butter|dip|chilli|knot|toast|seasoning|black|capsule|pearl|herb|salt|bloom|snappy|single|snack|cheese|naan|makhana|roast|masala|bites',u:'kg',t:200},
 {id:'coriander',q:'coriander leaves',must:['coriander|dhania'],not:'powder|seed|whole|organic|chutney|sauce|seasoning|masala|jeera|cumin|mint|curry|bloom|pudina|chilli|lemon|kit|combo|microgreen|dried',u:'kg',t:100},
 {id:'bhindi',q:'lady finger',must:['lady\\s?finger|bhindi|okra'],not:'organic|chip|fry|frozen|masala|bloom|crisp|kurkuri|snack|dried|red',u:'kg',t:500},
 {id:'carrot',q:'carrot',must:['carrot'],not:'juice|organic|halwa|cake|baby|frozen|chip|pickle|powder|shred|cut|bloom|red|delhi|english|beans|peas|mix|salad|puree|soup|ginger|beet|orange|smoothie|seed|kanji|drink',u:'kg',t:500},
 {id:'milk',q:'amul taaza toned milk',must:['amul','taaza'],not:'lassi|shake|kool|tea|coffee|slim|gold|cow|buffalo|double|flavo',u:'l',t:500},
 {id:'butter',q:'amul salted butter',qs:['amul butter'],must:['amul','butter'],not:'unsalted|cooking|lite|garlic|spread|cookie|chiplet|milk|ghee|pepper|herb|cheese|cake|peanut|mango|choco|biscuit|popcorn|chiplets|white|lassi|cutlet|scotch|masala',u:'100g',t:100},
 {id:'paneer',q:'amul fresh paneer',must:['amul','paneer'],not:'frozen|tikka|masala|cube|lite|low fat|protein|diced|fry|biryani|butter|kadai|kadhai|shahi',u:'kg',t:200},
 {id:'curd',q:'amul masti dahi',must:['amul','masti','dahi|curd'],not:'lassi|butter\\s?milk|chaas|spice|mishti|mishti|probiotic|greek|protein|shrikhand|raita|flavour|mango|strawberry|smoothie|yogurt|yoghurt|lite|slim',u:'kg',t:400},
 {id:'eggs',q:'eggs',must:['egg'],not:'brown|protein|boiled|kadaknath|desi|country|omega|free.range|organic|nog|less|noodle|masala|curry|pasta|quail|duck|liquid|powder|bite|chip|pan|fried|bhurji|roll|mayo|cake|bread|chocolate|kinder|surprise|toy|poach|yolk|cage.free|pastured|vitamin|kombucha|flavor|flavour|sprouted|dhaba|shaped|holder|beater|cooker|boiler',u:'pc',t:6},
 {id:'atta',q:'aashirvaad atta',must:['aashirvaad','atta'],not:'multigrain|multi grain|select|sharbati|sugar|millet|fibre|fiber|protein|organic|nature|bajra|jowar|ragi|besan|sooji|rice|khapli|gluten|diabetic|lite|chakki gold|namak|salt|spice|masala|instant|mix|quick|poha|vermicelli',u:'kg',t:5000},
 {id:'rice',q:'india gate basmati rice feast rozzana',must:['india gate','rozzana|rozana'],not:'brown|biryani|organic|mogra|lite',u:'kg',t:1000},
 {id:'dal',q:'tata sampann toor dal',must:['tata sampann','toor|arhar|tur'],not:'masala|organic|khichdi|mix|sambar|powder',u:'kg',t:1000},
 {id:'sugar',q:'sugar',must:['sugar'],not:'brown|free|jaggery|cube|powder|icing|organic|demerara|candy|mishri|lite|stevia|coconut|palm|khand|cane|syrup|less|no added|sugarfree|biscuit|coated|mint|gum|boil|jelly|tablet|substitute|natvia|sweetener|zero|breakfast|chocolate|cone|bura|castor|double refined|diet|sucralose|raw|desi|khandsari|pellets|sprinkle|glaze|pearl|vanilla|cinnamon|jam|monk|erythritol|allulose|dates?|honey|blend|nuts|dry|vegan|cotton',u:'kg',t:1000},
 {id:'salt',q:'tata salt',must:['tata','salt'],not:'lite|rock|pink|black|sendha|crystal|low sodium|plus|immuno|super|sea|himalayan|rasoi|shakti|iron|kala|lemon|pepper|chaat|flakes|garlic|seasoning|masala|kosher|pouch 2|chutney',u:'kg',t:1000},
 {id:'oil',q:'fortune sunflower oil',must:['fortune','sun(flower|lite)'],not:'rice|mustard|soya|groundnut|kachi|jar|can|tin|\\b5\\s?l|\\b15|kacchi|blend|vivo|filtered|ghee|combo|2 x|2x|pack of',u:'l',t:1000},
 {id:'ghee',q:'amul ghee',must:['amul','ghee'],not:'high aroma|danedar|brown|a2|butter|cookie|biscuit|chiplet|tin|combo|pack of|\\bx\\b',u:'l',t:1000},
 {id:'tea',q:'tata tea premium',must:['tata tea','premium'],not:'gold|agni|chakra|elaichi|green|masala|kadak|bags?|cardamom|ginger|tulsi|combo|free|jar',u:'100g',t:250},
 {id:'turmeric',q:'everest turmeric powder',must:['everest','turmeric|haldi'],not:'whole|sambar|garam|chilli|coriander|masala|combo|pack of|\\bx\\b',u:'100g',t:100},
 {id:'maggi',q:'maggi masala noodles',must:['maggi','masala'],not:'cuppa|atta|oats|pazzta|hot heads|korean|chicken|veggie|special|meri|chilli|curry|cup|mania|fusian|magic|double|pichkoo|ketchup|sauce|cubes|seasoning|no onion|jain|tricolor|tomato|biryani|shahi|pav|vegetable|power|dal|protein|millet|bhuna|spicy|schezwan|cheese',u:'100g',t:280},
 {id:'parleg',q:'parle g biscuit',must:['parle','\\bg\\b|glucose|parle-g'],not:'gold|choco|milky|nutri|20-20|monaco|hide|krack|marie|elaichi|wheat|atta|magix|hide|kismi|fab|bourbon|happy|cake|rusk|toast|cone|platina|digestive|cream|coconut|jeera|butter|namkeen|wafer|combo|pack of',u:'100g',t:250},
 {id:'detergent',q:'surf excel easy wash',must:['surf excel','easy wash'],not:'liquid|matic|bar|quick wash|front|top|combo|bucket',u:'kg',t:1000},
 {id:'vim',q:'vim dishwash bar',must:['vim','bar'],not:'gel|liquid|scrub|pouch|spong|combo|steel|anti.?smell|drops|foam|tub',u:'100g',t:300},
 {id:'toothpaste',q:'colgate strong teeth',must:['colgate','strong teeth'],not:'brush|kids|salt|herbal|max|visible|combo|amino|pack of|saver|\\bx\\b|2 x|x 2|twin',u:'100g',t:200}
];
function toNum(s){ if(s==null) return null; if(typeof s==='number') return s; const m=String(s).replace(/,/g,'').match(/(\d+(?:\.\d+)?)/); return m?parseFloat(m[1]):null; }
const UNIT = {kg:1000,g:1,gm:1,gms:1,gram:1,grams:1,gr:1,ml:1,l:1000,ltr:1000,litre:1000,liter:1000,litres:1000,liters:1000,lt:1000};
function parseQty(str){
  const s=(' '+String(str||'').toLowerCase().replace(/,/g,'')+' ');
  let m, qty=null, pcs=null;
  const U='(kg|gms?|grams?|gr|g|ml|ltrs?|litres?|liters?|lt|l)';
  if((m=s.match(new RegExp('(\\d+)\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)\\s*'+U+'\\b')))) qty=+m[1]*+m[2]*(UNIT[m[3].replace(/s$/,'')]||UNIT[m[3]]||1);
  else if((m=s.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*[x×]\\s*(\\d+)\\s*'+U+'?\\b'))) && m[3]) qty=+m[2]*+m[1]*(UNIT[m[3].replace(/s$/,'')]||1);
  else if((m=s.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*'+U+'\\s*[x×]\\s*(\\d+)\\b')))) qty=+m[1]*+m[3]*(UNIT[m[2].replace(/s$/,'')]||UNIT[m[2]]||1);
  else if((m=s.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*'+U+'?\\s*(?:-|to|–)\\s*(\\d+(?:\\.\\d+)?)\\s*'+U+'\\b')))){ const u2=UNIT[m[4].replace(/s$/,'')]||UNIT[m[4]]||1; const u1=m[2]?(UNIT[m[2].replace(/s$/,'')]||UNIT[m[2]]||1):u2; qty=(+m[1]*u1 + +m[3]*u2)/2; }
  else if((m=s.match(new RegExp('(\\d+(?:\\.\\d+)?)\\s*'+U+'\\b')))) qty=+m[1]*(UNIT[m[2].replace(/s$/,'')]||UNIT[m[2]]||1);
  if((m=s.match(/(\d+)\s*(?:pcs?|pieces?|units?|nos?|eggs?|pack of)\b/))) pcs=+m[1];
  else if((m=s.match(/pack of\s*(\d+)/))) pcs=+m[1];
  return {qty,pcs};
}
// cand: {n,p,sp,mrp,oos,img?}
function pick(item, cands){
  const must=item.must.map(X), not=X(item.not);
  const ok=[];
  for(const c of cands){
    const nm=c.n||''; if(!must.every(r=>r.test(nm))) continue; if(not.test(nm)) continue;
    const q=parseQty((c.p||'')+' | '+nm);
    let up=null, base=null;
    if(item.u==='pc'){ base=q.pcs; if(base) up=c.sp/base; }
    else { base=q.qty; if(base && item.u==='l'){ const tx=(c.p||'')+' '+nm; if(/\d\s*(g|gm|gms|kg)\b/i.test(tx) && !/\d\s*(ml|l|ltr|litre|liter)\b/i.test(tx)) base=Math.round(base/0.91); } if(base){ up = item.u==='100g'? c.sp/(base/100) : c.sp/(base/1000);} }
    if(up==null || !c.sp) continue;
    ok.push({...c, base, up});
  }
  if(!ok.length) return null;
  const inS=ok.filter(c=>!c.oos); const pool=inS.length?inS:ok;
  pool.sort((a,b)=>{ const da=Math.abs(Math.log(a.base/item.t)), db=Math.abs(Math.log(b.base/item.t)); if(Math.abs(da-db)>0.12) return da-db; return a.up-b.up; });
  const best=pool[0]; const cheapest=[...pool].sort((a,b)=>a.up-b.up)[0];
  return {n:best.n,p:best.p,sp:best.sp,mrp:best.mrp,oos:best.oos?1:0,base:best.base,up:Math.round(best.up*100)/100,nm:ok.length,cu:Math.round(cheapest.up*100)/100};
}
function row(plat,pinId,item,r){ return r?[plat,pinId,item.id,r.n,r.p,r.sp,r.mrp,r.oos,r.base,r.up,r.cu,r.nm]:[plat,pinId,item.id,null]; }
return {PINS,ITEMS,parseQty,pick,row,toNum};
})();
