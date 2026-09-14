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
  } catch {
    return false;
  }
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
<meta name="robots" content="noindex,nofollow,noarchive,max-image-preview:none">
<meta name="referrer" content="no-referrer">
<style>:root{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#222;background:#faf8f5;--brick:#a84d3f;--brickdark:#873c31;--ink:#222;--cream:#f6f0e7;--soft:#faf8f5;--muted:#6f6b67;--line:#e5ddd2;--green:#377d65;--greenlight:#eef7f2}*{box-sizing:border-box}body{margin:0;background:var(--soft)}button,input,select{font:inherit}.top{position:sticky;top:0;z-index:5;background:#fffffff5;border-bottom:1px solid var(--line);backdrop-filter:blur(14px)}.topin{max-width:1220px;margin:auto;padding:10px 24px;display:flex;justify-content:space-between;align-items:center}.approved-logo{display:block;width:min(250px,48vw);height:auto}.preview{font-size:9px;font-weight:850;color:var(--muted);letter-spacing:.05em}.wrap{max-width:1220px;margin:auto;padding:18px 24px 110px}.v3nav{grid-column:1/-1;display:flex;gap:6px;background:#fff;border:1px solid var(--line);padding:5px;border-radius:18px;margin-bottom:4px}.v3nav button{flex:1;border:0;background:transparent;border-radius:13px;padding:11px 8px;font-size:13px;font-weight:850;color:var(--muted)}.v3nav button.active{background:var(--brick);color:#fff}.v3nav b{display:inline-block;min-width:19px;padding:2px 5px;border-radius:999px;background:#eee8e2;font-size:9px;color:var(--ink)}.v3nav button.active b{background:#ffffff2b;color:#fff}.panel{grid-column:1/-1;background:#fff;color:#171715;border:1px solid #e9e6df;border-radius:24px;padding:24px 26px;margin-bottom:8px}.panel .section-title{font-size:31px;margin:0 0 15px;letter-spacing:-.045em}.panel .note{color:#77736c}.filtertitle{display:flex;justify-content:space-between;align-items:center;gap:12px}.resetfilters{border:1px solid #ddd;background:#fff;border-radius:999px;padding:7px 11px;font-size:11px;font-weight:850}.quickchips{display:flex;gap:7px;overflow:auto;margin:13px -3px 0;padding:2px 3px 5px}.filterchip{flex:0 0 auto;border:1px solid #ddd;background:#fff;border-radius:999px;padding:8px 12px;font-size:11px;font-weight:850}.morefilterbox{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:11px;padding-top:13px;border-top:1px solid #ddd}.resultline{margin-top:13px;font-size:12px}.card{background:#fff;border:1px solid #ebe4dc;border-radius:22px;overflow:hidden;margin-bottom:14px}.photo{height:300px;background-size:cover;background-position:center;position:relative;cursor:pointer}.cardbody{padding:16px 17px 17px}.eyebrow{font-size:10px;text-transform:uppercase;letter-spacing:.075em;color:var(--muted);font-weight:850}.title{font-size:21px;font-weight:900;margin:6px 0 3px}.price{font-size:27px;font-weight:950}.muted,.note{color:var(--muted);font-size:12px}.row{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid var(--line)}.badge{display:inline-block;padding:6px 9px;border-radius:999px;background:var(--greenlight);color:var(--green);font-size:10px;font-weight:850;margin:7px 4px 1px 0}.section-title{font-size:20px;font-weight:950;margin:0 0 10px}input,select{width:100%;padding:12px 13px;border:1px solid var(--line);border-radius:12px;background:#fff;font-size:15px;margin-top:5px}.favline{display:flex;justify-content:space-between}.heart{border:0;background:#fff;font-size:27px;color:var(--brick)}.cardactions{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--line)}.detailsbtn,.back{border:0;border-radius:999px;padding:10px 17px;background:var(--brick);color:#fff;font-weight:850}.comparebox{font-size:12px;color:var(--muted)}.comparedock{position:fixed;z-index:9;left:50%;transform:translateX(-50%);bottom:30px;width:min(560px,calc(100% - 24px));background:#222;color:#fff;border-radius:18px;padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:10px}.bottom{position:fixed;bottom:0;left:0;right:0;background:#fffffff0;border-top:1px solid var(--line);padding:7px;text-align:center;font-size:9px;color:#9b938d;z-index:7}@media(max-width:600px){.topin,.wrap{padding-left:13px;padding-right:13px}.approved-logo{width:min(215px,58vw)}.wrap{padding-top:10px}.v3nav{position:sticky;top:58px;z-index:4}.v3nav button{font-size:12px;padding:10px 5px}.panel{padding:18px 16px;border-radius:19px}.photo{height:270px}.card{border-radius:19px}.comparedock{bottom:27px}}@media(min-width:760px){#v3-root{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.panel,.card{margin-bottom:0}.photo{height:310px}.v3nav{grid-column:1/-1}}@media(min-width:1080px){#v3-root{grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.panel,.v3nav{grid-column:1/-1}}@media(min-width:701px){#v3-root>.v3nav{grid-column:1/-1!important;display:flex!important;align-items:center!important;justify-content:stretch!important;gap:8px!important;width:100%!important;min-height:52px!important;margin:0 0 18px!important;padding:6px!important;border:1px solid #e9e6df!important;border-radius:16px!important;background:#fff!important;box-shadow:0 5px 18px #4934290c!important;overflow:visible!important}#v3-root>.v3nav button{display:flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;flex:1 1 0!important;min-height:40px!important;padding:9px 14px!important;border-radius:11px!important;font-size:13px!important;font-weight:800!important;color:#77736c!important;background:transparent!important}#v3-root>.v3nav button.active{background:#171715!important;color:#fff!important}}</style>
</head><body>
<header class="top"><div class="topin"><img class="approved-logo" src="/fuorisede-logo-approved.png" alt="FUORISEDE"><div class="preview">CONFRONTO_BRESCIA_1 · ACCESSO RISERVATO</div></div></header>
<main class="wrap" id="v3-root"><section class="panel"><b>Caricamento alloggi…</b></section></main>
<div class="bottom">FUORISEDE · confronto richiesto · non indicizzato</div>
<script>
window.FUORISEDE_FALLBACK_LISTINGS=[
{id:401,title:'Stanza singola · Europa',city:'Brescia',address:'Zona Europa, Brescia',lat:45.56278,lng:10.23472,locationStatus:'approximate_area',price:350,expenses:null,realMonthlyCost:350,realMonthlyCostStatus:'minimum_known',photos:['https://cercoalloggio-reas.s3-eu-west-1.amazonaws.com/c7ba8180-36bf-4685-b5f1-10fcf0cf5975.jpg'],accommodationType:'room',features:['Stanza singola','Balcone ad uso esclusivo','Condominio incluso','Solo donne','2° piano','Senza ascensore'],details:{utilities:'Spese escluse; condominio incluso',contract:'Da verificare nell’annuncio originale',deposit:'2 mensilità',bathroom:'Non privato',floor:'2° piano · ascensore assente',description:'Camera singola per studentessa in zona Europa, con balcone ad uso esclusivo. Letto, armadio a muro, scrivania, cassettiera e comodino.'},availability:{availableFrom:null,availableLabel:'Da verificare',status:'to_reconfirm',confirmedAt:'2026-09-13'},publication:{status:'sandbox',authorized:false,source:'CercoAlloggio · confronto richiesto dall’utente',sourceType:'portal',sourceUrl:'https://cercoalloggio.com/it/property/appartamento-brescia-europa-13783-ampie-camere-singole-vicino-a-fermata-metro-europa/1-G704'},validation:{contactProvided:false,priceDeclared:true,expensesDeclared:true,contractDeclared:false,depositDeclared:true,utilitiesDeclared:true,listingConfirmedAt:'2026-09-13'},campusReference:{campusId:'brescia-unibs-ing-info',campusName:'UNIBS · Ingegneria Informatica / Via Branze',distanceKm:0.4,minutesBike:2,travelEstimate:false},candidates:0},
{id:402,title:'Stanza singola · Casazza',city:'Brescia',address:'Zona Casazza, Brescia',lat:45.57566,lng:10.23049,locationStatus:'approximate_area',price:420,expenses:null,realMonthlyCost:420,realMonthlyCostStatus:'minimum_known',photos:['https://img-cercoalloggio.s3.eu-south-1.amazonaws.com/img-25d07479-db78-4a8e-ac4e-d29b65349c69.jpeg'],accommodationType:'room',features:['Stanza singola','4 camere singole','2 bagni','Terrazzo','Cucina abitabile','Riscaldamento centralizzato','Solo donne','2° piano','Senza ascensore'],details:{utilities:'Da verificare nell’annuncio originale',contract:'Da 6 mesi a più di un anno · canone libero',deposit:'Da verificare',bathroom:'2 bagni nell’appartamento',floor:'2° piano · ascensore assente',description:'Ampio appartamento in zona Casazza con soggiorno e accesso al terrazzo, cucina abitabile attrezzata con retrocucina, quattro camere singole e due bagni.'},availability:{availableFrom:null,availableLabel:'Da verificare',status:'to_reconfirm',confirmedAt:'2026-09-13'},publication:{status:'sandbox',authorized:false,source:'CercoAlloggio · confronto richiesto dall’utente',sourceType:'portal',sourceUrl:'https://cercoalloggio.com/it/property/appartamento-brescia-casazza-29039-disponibili-stanze-singole-per-studentesse-e-lavoratrici-in-zona-casazza'},validation:{contactProvided:false,priceDeclared:true,expensesDeclared:false,contractDeclared:true,depositDeclared:false,utilitiesDeclared:false,listingConfirmedAt:'2026-09-13'},campusReference:{campusId:'brescia-unibs-ing-info',campusName:'UNIBS · Ingegneria Informatica / Via Branze',distanceKm:1.34,minutesBike:6,travelEstimate:false},candidates:0}
];
(function(){var nativeFetch=window.fetch&&window.fetch.bind(window);if(nativeFetch){window.fetch=function(input,init){var url=typeof input==='string'?input:(input&&input.url)||'';if(url.indexOf('/data/listings-operativa-v3.json')!==-1){return Promise.resolve({ok:true,status:200,json:function(){return Promise.resolve(window.FUORISEDE_FALLBACK_LISTINGS.slice())}})}return nativeFetch(input,init)}}})();
</script>
<script src="/app.js?v=confronto-brescia-1-stable"></script>
<script>
(function(){
const campus={id:'brescia-unibs-ing-info',name:'UNIBS · Ingegneria Informatica / Via Branze',lat:45.5651,lng:10.2317};
function install(){
 if(typeof state==='undefined'||typeof render!=='function'||typeof filters!=='function')return false;
 if(typeof campusCoordinates!=='undefined')campusCoordinates[campus.id]=[campus.lat,campus.lng];
 const oldFilters=filters;
 filters=function(){let html=oldFilters();if(!html.includes('value="Brescia"'))html=html.replace('<option value="Milano"','<option value="Brescia" '+(state.city==='Brescia'?'selected':'')+'>Brescia</option><option value="Milano"');if(state.city==='Brescia'){html=html.replace(/<label class="note">Zona \/ polo<select[\\s\\S]*?<\\/select><\\/label>/,'<label class="note">Sede di studio<select disabled><option>UNIBS · Ingegneria Informatica / Via Branze</option></select></label>');html=html.replace(/<section class="designhero">[\\s\\S]*?<\\/section>/,'<section class="designhero"><div class="kicker">BRESCIA · UNIBS · VIA BRANZE</div><h1>Due stanze.<br>Una scelta.</h1><p>Confronta canone, spese, caratteristiche e distanza dalla sede di Ingegneria Informatica.</p></section>')}return html};
 const oldSelected=typeof selectedStudySite==='function'?selectedStudySite:null;if(oldSelected)selectedStudySite=function(){return state.city==='Brescia'?{name:campus.name,lat:campus.lat,lng:campus.lng}:oldSelected()};
 state.items=state.items.filter(x=>x.city==='Brescia');state.city='Brescia';document.title='Confronto alloggi studenti Brescia · UNIBS | FUORISEDE';render();return true;
}
if(!install()){let n=0,t=setInterval(()=>{if(install()||++n>80)clearInterval(t)},50)}
})();
</script>
</body></html>`);
};
