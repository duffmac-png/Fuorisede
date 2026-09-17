(function(){
'use strict';
var ENDPOINT='/api/pilot-events';
var SESSION='fuorisede_pilot_session';
function rid(){return 's_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,10)}
function sid(){try{var v=sessionStorage.getItem(SESSION);if(!v){v=rid();sessionStorage.setItem(SESSION,v)}return v}catch(e){return rid()}}
var session=sid();
function listing(el){var card=el&&el.closest&&el.closest('[data-id],.card,.detail,.dddetail');if(!card)return {};var id=card.getAttribute('data-id')||(card.dataset&&card.dataset.id)||'';var title=(card.querySelector('.title,h1,h2,h3')||{}).textContent||'';return {listingId:String(id).slice(0,80),listingTitle:String(title).trim().slice(0,160)}}
function send(event,extra){var body=Object.assign({event:event,sessionId:session,path:location.pathname,ts:new Date().toISOString()},extra||{});try{var json=JSON.stringify(body);if(navigator.sendBeacon){navigator.sendBeacon(ENDPOINT,new Blob([json],{type:'application/json'}));return}fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json'},body:json,keepalive:true}).catch(function(){})}catch(e){}}
window.FuorisedePilotMonitor={track:send,sessionId:session};
send('visit');
document.addEventListener('click',function(e){var el=e.target.closest&&e.target.closest('a,button,label,input');if(!el)return;var text=((el.textContent||el.value||'')+'').trim().toLowerCase();var info=listing(el);if(/dettagli|scheda|scopri/.test(text))send('listing_open',info);if(/confront/.test(text))send('compare_action',info);if(/mi interessa/.test(text))send('interest_click',info);if(/chiedi informazioni|richiedi integrazione/.test(text))send('info_click',info);if(/avvisami/.test(text))send('alert_click',info);var a=el.closest('a'),href=a&&a.href||'';if(/phosphoro|ph4you/i.test(href)||/annuncio originale|apri annuncio/.test(text))send('partner_out',Object.assign(info,{partner:'phosphoro'}))},true);
})();