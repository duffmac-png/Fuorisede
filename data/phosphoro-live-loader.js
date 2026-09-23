const PHOSPHORO_FEED = 'https://roomanager.phosphoro.com/public/tmp/fuorisede.json';
const LOCAL_BLOCKS = ['/data/phosphoro-1.json','/data/phosphoro-2.json','/data/phosphoro-3.json','/data/phosphoro-4.json','/data/phosphoro-5.json','/data/phosphoro-6.json'];

async function json(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status+' for '+url);return r.json()}
function arr(raw){if(Array.isArray(raw))return raw;for(const k of ['items','listings','annunci','data'])if(Array.isArray(raw?.[k]))return raw[k];return[]}
function it(v){if(v==null)return null;if(typeof v==='string')return v;return v.it||v.en||null}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function features(p,room){const out=[];if(p.wifi)out.push('Wi-Fi');if(p.washingMachine)out.push('Lavatrice');if(p.dishwasher)out.push('Lavastoviglie');if(p.elevator)out.push('Ascensore');if(room?.balcony||p.balcony)out.push('Balcone');if(p.furnished)out.push('Arredato');if(p.dryer)out.push('Asciugatrice');return out}
function campus(p){const z=Array.isArray(p.nearbyZones)?p.nearbyZones[0]:null;return z?{campusId:'centro',campusName:it(z.title)||'Polo universitario',distanceKm:null,minutesBike:n(z.bikeMinutes),travelEstimate:false}:{campusId:'centro',campusName:'Polo universitario',distanceKm:null,minutesBike:null,travelEstimate:true}}
function normalize(x){
 const p=x.property||{}, room=x.room||{}, price=n(x.monthlyPrice), dep=n(x.depositPrice), min=n(x.minimumStay);
 const date=(x.availableFrom||'').trim(); const today=new Date().toISOString().slice(0,10);
 return {
  id:10000+n(x.id),externalId:String(x.id),title:it(x.title)||x.code||'Alloggio Phosphoro',city:p.city||'Ferrara',
  address:[p.address,p.houseNumber,p.city].filter(Boolean).join(' ').replace(' '+(p.city||''),'')+', '+(p.city||'Ferrara'),
  lat:n(p.latitude),lng:n(p.longitude),locationStatus:'verified_street',price,expenses:null,realMonthlyCost:price,realMonthlyCostStatus:'minimum_known',
  photos:(room.photos?.length?room.photos:p.photos||[]).slice(0,4),features:features(p,room),
  details:{utilities:'Da verificare nell’annuncio Phosphoro',contract:min?'Permanenza minima '+min+' mesi':'Da verificare nell’annuncio Phosphoro',deposit:dep!=null?'€ '+dep:'Da verificare',bathroom:room.privateBathroom?'Privato':'Condiviso',floor:p.floor!=null?String(p.floor):'Da verificare'},
  availability:{availableFrom:date||null,availableLabel:date?'Disponibile dal '+date.split('-').reverse().join('/'):'Disponibile ora',status:'confirmed',confirmedAt:today},
  publication:{status:'authorized',authorized:true,source:'Phosphoro',sourceUrl:x.url,sourceType:'portal'},
  validation:{priceDeclared:price!=null,expensesDeclared:false,contractDeclared:min!=null,utilitiesDeclared:false,listingConfirmedAt:today},
  campusReference:campus(p),candidates:0,accommodationType:x.type&&x.type.includes('stanza')?'room':'apartment'
 }
}
async function live(){const items=arr(await json(PHOSPHORO_FEED));if(!items.length)throw new Error('empty feed');return items.map(normalize).filter(x=>x.externalId&&x.city==='Ferrara')}
async function local(){return (await Promise.all(LOCAL_BLOCKS.map(json))).flat()}
function dedupe(items){const m=new Map();for(const x of items){const k=x.publication?.source==='Phosphoro'?'phosphoro:'+String(x.externalId??x.id):'local:'+String(x.id);m.set(k,x)}return[...m.values()]}
export async function loadFerraraListings(){const base=await json('/data/listings-operativa-v3.json');let phosphoro;try{phosphoro=await live();console.info('PHOSPHORO_LIVE_OK',phosphoro.length)}catch(e){console.warn('PHOSPHORO_LIVE_FALLBACK',String(e));phosphoro=await local()}return dedupe([...base,...phosphoro]).filter(x=>x.city==='Ferrara')}
