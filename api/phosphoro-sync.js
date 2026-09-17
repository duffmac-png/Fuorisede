// Phosphoro/PH4YOU pilot feed normalizer + snapshot diff.
// POST { payload: <raw Phosphoro object|array>, previous: <normalized array optional> }
// This endpoint does not fetch a partner URL yet: the stable feed URL and removal semantics
// still need to be confirmed with Phosphoro before automatic polling is enabled.

function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function text(v){if(v==null)return '';if(typeof v==='string')return v;return v.it||v.en||''}
function stripHtml(v){return text(v).replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()}
function money(v){const x=n(v);return x==null?null:x}
function uniq(a){return [...new Set(a.filter(Boolean))]}
function sourceUrl(raw){return raw.sourceUrl||raw.url||raw.listingUrl||raw.smartLink||null}

function normalizeOne(input){
  const raw=input&&input.listing?input.listing:input;
  if(!raw||raw.id==null)return null;
  const p=raw.property||{}, r=raw.room||{};
  const price=money(raw.monthlyPrice), expenses=money(raw.expensesPrice);
  const features=uniq([
    raw.type==='stanza_singola'?'Stanza singola':raw.type==='stanza_doppia'?'Stanza doppia':null,
    p.furnished?'Arredato':null,p.wifi?'Wi-Fi':null,p.elevator?'Ascensore':null,
    p.television?'TV':null,p.refrigerator?'Frigorifero':null,p.freezer?'Freezer':null,
    p.washingMachine?'Lavatrice':null,p.dishwasher?'Lavastoviglie':null,
    r.privateBathroom?'Bagno privato':null,r.balcony?'Balcone':null,r.airConditioning?'Aria condizionata':null
  ]);
  const photos=(r.photos&&r.photos.length?r.photos:p.photos)||[];
  const ext=String(raw.id);
  return {
    id:900000+(n(raw.id)||0),externalId:ext,title:text(raw.title)||raw.code||`Alloggio ${ext}`,
    city:p.city||'',address:[p.address,p.houseNumber,p.city].filter(Boolean).join(' '),
    lat:n(p.latitude),lng:n(p.longitude),locationStatus:'partner_feed',
    accommodationType:raw.type&&raw.type.indexOf('stanza')===0?'room':'apartment',
    price,expenses,realMonthlyCost:price!=null&&expenses!=null?price+expenses:null,
    realMonthlyCostStatus:price!=null&&expenses!=null?'complete':'partial',photos,features,
    details:{
      utilities:expenses!=null?`Spese mensili indicate dal partner: €${expenses}`:'Spese da verificare',
      contract:raw.contractType?`${raw.contractType==='transitorio'?'Contratto transitorio':raw.contractType}${raw.minimumStay?` · permanenza minima ${raw.minimumStay} mesi`:''}`:'Contratto da verificare',
      deposit:money(raw.depositPrice)!=null?`€${money(raw.depositPrice).toLocaleString('it-IT')}`:'Da verificare',
      bathroom:r.privateBathroom?'Bagno privato':'Bagno condiviso',
      floor:p.floor!=null?`${p.floor}° piano${p.elevator?' · ascensore':''}`:'Da verificare',
      description:stripHtml(r.description)||stripHtml(p.description)||'Dati importati dal feed Phosphoro/PH4YOU.'
    },
    availability:{availableFrom:raw.availableFrom||null,availableLabel:'Disponibilità da verificare con Phosphoro',status:raw.enabled===false?'disabled':'declared',confirmedAt:null},
    publication:{status:'partner_pilot',authorized:raw.enabled!==false,source:'Phosphoro / PH4YOU',sourceType:'partner',sourceUrl:sourceUrl(raw)},
    validation:{priceDeclared:price!=null,expensesDeclared:expenses!=null,contractDeclared:!!raw.contractType,utilitiesDeclared:Array.isArray(raw.expenses)&&raw.expenses.length>0,listingConfirmedAt:new Date().toISOString().slice(0,10)},
    campusReference:{campusId:null,campusName:p.city?`Università di ${p.city}`:null,distanceKm:null,minutesBike:null,travelEstimate:true},
    partner:{listingId:ext,propertyId:p.id!=null?String(p.id):null,roomId:r.id!=null?String(r.id):null,code:raw.code||raw.slug||null,enabled:raw.enabled!==false,minimumStayMonths:n(raw.minimumStay),depositPrice:money(raw.depositPrice),roomSquareMetres:n(r.squareMetres),propertySquareMetres:n(p.squareMetres),energyClass:p.energyClass||null},
    candidates:0
  };
}

function normalizePayload(payload){
  let rows=Array.isArray(payload)?payload:[payload];
  if(payload&&Array.isArray(payload.listings))rows=payload.listings;
  return rows.map(normalizeOne).filter(Boolean);
}
const WATCH=['title','city','address','price','expenses','realMonthlyCost','photos','features','availability','publication','partner'];
function stable(v){return JSON.stringify(v==null?null:v)}
function diff(previous,current){
  const before=new Map((previous||[]).map(x=>[String(x.externalId||x.partner?.listingId||x.id),x]));
  const after=new Map(current.map(x=>[String(x.externalId||x.partner?.listingId||x.id),x]));
  const added=[],updated=[],removed=[];
  for(const [id,now] of after){const old=before.get(id);if(!old){added.push(id);continue}const fields=WATCH.filter(k=>stable(old[k])!==stable(now[k]));if(fields.length)updated.push({id,fields})}
  for(const [id,old] of before)if(!after.has(id))removed.push({id,title:old.title||null});
  return {added,updated,removed};
}

module.exports=(req,res)=>{
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({ok:false,error:'POST required'})}
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const payload=Object.prototype.hasOwnProperty.call(body,'payload')?body.payload:body;
    const current=normalizePayload(payload);
    const previous=Array.isArray(body.previous)?body.previous:[];
    return res.status(200).json({ok:true,count:current.length,current,changes:diff(previous,current),automation:{readyForPolling:false,reason:'Stable partner feed URL and removal semantics not yet confirmed'}})
  }catch(e){return res.status(400).json({ok:false,error:e.message||'Invalid payload'})}
};
