const crypto = require('crypto');

const USER = 'michi';
const PASSWORD_SHA256 = '53fd9990be04790dd3289d0c35f8db544111fe79c7c9d90f11f51ff2ae8cf188';

function authorized(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) return false;
  try {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
    const i = decoded.indexOf(':');
    if (i < 0) return false;
    const user = decoded.slice(0, i);
    const pass = decoded.slice(i + 1);
    const hash = crypto.createHash('sha256').update(pass).digest('hex');
    return user === USER && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(PASSWORD_SHA256));
  } catch { return false; }
}

module.exports = function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (!authorized(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="FUORISEDE - Confronto Brescia 1", charset="UTF-8"');
    return res.status(401).send('Accesso riservato al confronto FUORISEDE.');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(`<!doctype html>
<html lang="it"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Confronto alloggi studenti Brescia · UNIBS | FUORISEDE</title>
<meta name="robots" content="noindex,nofollow,noarchive,max-image-preview:none"><meta name="referrer" content="no-referrer">
<style>
:root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#222;background:#faf8f5;--brick:#a84d3f;--ink:#222;--soft:#faf8f5;--muted:#6f6b67;--line:#e5ddd2}*{box-sizing:border-box}body{margin:0;background:var(--soft)}button,input,select{font:inherit}.top{position:sticky;top:0;z-index:20;background:#fffffff5;border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}.topin{max-width:1220px;margin:auto;padding:10px 24px;display:flex;justify-content:space-between;align-items:center}.approved-logo{display:block;width:min(250px,48vw);height:auto}.preview{font-size:9px;font-weight:850;color:var(--muted);letter-spacing:.05em}.wrap{max-width:1220px;margin:auto;padding:18px 24px 110px}.bottom{position:fixed;bottom:0;left:0;right:0;background:#fffffff0;border-top:1px solid var(--line);padding:7px;text-align:center;font-size:9px;color:#9b938d;z-index:20}@media(max-width:600px){.topin,.wrap{padding-left:13px;padding-right:13px}.approved-logo{width:min(215px,58vw)}}@media(min-width:701px){#v3-root>.v3nav{grid-column:1/-1!important;display:flex!important;align-items:center!important;justify-content:stretch!important;gap:8px!important;width:100%!important;min-height:52px!important;margin:0 0 18px!important;padding:6px!important;border:1px solid #e9e6df!important;border-radius:16px!important;background:#fff!important;box-shadow:0 5px 18px #4934290c!important;overflow:visible!important}#v3-root>.v3nav button{display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;flex:1 1 0!important;min-height:40px!important;padding:9px 14px!important;border-radius:11px!important;font-size:13px!important;font-weight:800!important;color:#77736c!important;background:transparent!important}#v3-root>.v3nav button.active{background:#171715!important;color:#fff!important}}
</style></head><body>
<header class="top"><div class="topin"><img class="approved-logo" src="/fuorisede-logo-approved.png" alt="FUORISEDE"><div class="preview" id="comparison-identity">CONFRONTO_BRESCIA_1 · ACCESSO RISERVATO</div></div></header>
<main class="wrap" id="v3-root"><section><b>Caricamento alloggi…</b></section></main>
<div class="bottom">FUORISEDE · CONFRONTO_BRESCIA_1 · non indicizzato</div>
<script>
window.FUORISEDE_FALLBACK_LISTINGS=[
{id:401,title:'Stanza singola · Europa',city:'Brescia',address:'Zona Europa, Brescia',lat:45.56278,lng:10.23472,locationStatus:'approximate_area',price:350,expenses:null,realMonthlyCost:350,realMonthlyCostStatus:'minimum_known',photos:['https://cercoalloggio-reas.s3-eu-west-1.amazonaws.com/c7ba8180-36bf-4685-b5f1-10fcf0cf5975.jpg'],accommodationType:'room',features:['Stanza singola','Balcone ad uso esclusivo','Condominio incluso','Solo donne','2° piano','Senza ascensore'],details:{utilities:'Spese escluse; condominio incluso',contract:'Da verificare nell’annuncio originale',deposit:'2 mensilità',bathroom:'Non privato',floor:'2° piano · ascensore assente',description:'Camera singola per studentessa in zona Europa, con balcone ad uso esclusivo. Letto, armadio a muro, scrivania, cassettiera e comodino.'},availability:{availableFrom:null,availableLabel:'Da verificare',status:'to_reconfirm',confirmedAt:'2026-09-13'},publication:{status:'sandbox',authorized:false,source:'CercoAlloggio · confronto richiesto dall’utente',sourceType:'portal',sourceUrl:'https://cercoalloggio.com/it/property/appartamento-brescia-europa-13783-ampie-camere-singole-vicino-a-fermata-metro-europa/1-G704'},validation:{contactProvided:false,priceDeclared:true,expensesDeclared:true,contractDeclared:false,depositDeclared:true,utilitiesDeclared:true,listingConfirmedAt:'2026-09-13'},campusReference:{campusId:'brescia-unibs-ing-info',campusName:'UNIBS · Ingegneria Informatica / Via Branze',distanceKm:0.4,minutesBike:2,travelEstimate:false},candidates:0},
{id:402,title:'Stanza singola · Casazza',city:'Brescia',address:'Zona Casazza, Brescia',lat:45.57566,lng:10.23049,locationStatus:'approximate_area',price:420,expenses:null,realMonthlyCost:420,realMonthlyCostStatus:'minimum_known',photos:['https://img-cercoalloggio.s3.eu-south-1.amazonaws.com/img-25d07479-db78-4a8e-ac4e-d29b65349c69.jpeg'],accommodationType:'room',features:['Stanza singola','4 camere singole','2 bagni','Terrazzo','Cucina abitabile','Riscaldamento centralizzato','Solo donne','2° piano','Senza ascensore'],details:{utilities:'Da verificare nell’annuncio originale',contract:'Da 6 mesi a più di un anno · canone libero',deposit:'Da verificare',bathroom:'2 bagni nell’appartamento',floor:'2° piano · ascensore assente',description:'Ampio appartamento in zona Casazza con soggiorno e accesso al terrazzo, cucina abitabile attrezzata con retrocucina, quattro camere singole e due bagni.'},availability:{availableFrom:null,availableLabel:'Da verificare',status:'to_reconfirm',confirmedAt:'2026-09-13'},publication:{status:'sandbox',authorized:false,source:'CercoAlloggio · confronto richiesto dall’utente',sourceType:'portal',sourceUrl:'https://cercoalloggio.com/it/property/appartamento-brescia-casazza-29039-disponibili-stanze-singole-per-studentesse-e-lavoratrici-in-zona-casazza'},validation:{contactProvided:false,priceDeclared:true,expensesDeclared:false,contractDeclared:true,depositDeclared:false,utilitiesDeclared:false,listingConfirmedAt:'2026-09-13'},campusReference:{campusId:'brescia-unibs-ing-info',campusName:'UNIBS · Ingegneria Informatica / Via Branze',distanceKm:1.34,minutesBike:6,travelEstimate:false},candidates:0}
];
(function(){var nativeFetch=window.fetch&&window.fetch.bind(window);if(nativeFetch){window.fetch=function(input,init){var url=typeof input==='string'?input:(input&&input.url)||'';if(url.indexOf('/data/listings-operativa-v3.json')!==-1){return Promise.resolve({ok:true,status:200,json:function(){return Promise.resolve(window.FUORISEDE_FALLBACK_LISTINGS.slice())}})}return nativeFetch(input,init)}}})();
</script>
<script src="/app.js?v=confronto-brescia-1-stable-2"></script>
<script>
(function(){
const campus={id:'brescia-unibs-ing-info',name:'UNIBS · Ingegneria Informatica / Via Branze',lat:45.5651,lng:10.2317};
function enforceIdentity(){
 document.title='Confronto alloggi studenti Brescia · UNIBS | FUORISEDE';
 document.querySelectorAll('.preview').forEach(function(el){el.textContent='CONFRONTO_BRESCIA_1 · ACCESSO RISERVATO'});
 var labels=document.querySelectorAll('label');
 labels.forEach(function(label){
   var txt=(label.textContent||'').trim().toLowerCase();
   var sel=label.querySelector('select');
   if(sel && (txt.indexOf('città')!==-1 || txt.indexOf('citta')!==-1)){
     sel.innerHTML='<option value="Brescia" selected>Brescia</option>';
     sel.value='Brescia'; sel.disabled=true;
   }
 });
 var hero=document.querySelector('.designhero');
 if(hero){hero.innerHTML='<div class="kicker">BRESCIA · UNIBS · VIA BRANZE</div><h1>Due stanze.<br>Una scelta.</h1><p>Confronta canone, spese, caratteristiche e distanza dalla sede di Ingegneria Informatica.</p>'}
}
function install(){
 if(typeof state==='undefined'||typeof render!=='function'||typeof filters!=='function')return false;
 if(typeof campusCoordinates!=='undefined')campusCoordinates[campus.id]=[campus.lat,campus.lng];
 const oldFilters=filters;
 filters=function(){let html=oldFilters();if(!html.includes('value="Brescia"'))html=html.replace('<option value="Milano"','<option value="Brescia" selected>Brescia</option><option value="Milano"');return html};
 const oldSelected=typeof selectedStudySite==='function'?selectedStudySite:null;if(oldSelected)selectedStudySite=function(){return state.city==='Brescia'?{name:campus.name,lat:campus.lat,lng:campus.lng}:oldSelected()};
 state.items=window.FUORISEDE_FALLBACK_LISTINGS.slice();state.city='Brescia';render();enforceIdentity();return true;
}
if(!install()){let n=0,t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},50)}
let busy=false;new MutationObserver(function(){if(busy)return;busy=true;requestAnimationFrame(function(){enforceIdentity();busy=false})}).observe(document.body,{childList:true,subtree:true});
})();
</script></body></html>`);
};
