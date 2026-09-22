(function(){
const css=`.fs-tip{position:relative;display:inline-flex;align-items:center;justify-content:center;width:17px;height:17px;margin-left:4px;padding:0;border:1px solid currentColor;border-radius:50%;background:transparent;color:inherit;font:900 10px/1 system-ui;cursor:pointer;vertical-align:middle}.fs-tip::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 9px);transform:translateX(-50%);z-index:5000;width:min(290px,78vw);padding:9px 11px;border-radius:10px;background:#222;color:#fff;font:600 11px/1.35 system-ui;box-shadow:0 6px 22px #0004;white-space:normal;text-align:left;opacity:0;pointer-events:none}.fs-tip:hover::after,.fs-tip:focus::after,.fs-tip.open::after{opacity:1}@media(max-width:600px){.fs-tip::after{position:fixed;left:50%;bottom:88px;transform:translateX(-50%);width:calc(100vw - 34px);font-size:12px;padding:12px 14px}}.dddetail .ddfeature,.dddetail .statmark,.dddetail .statmark.warn,.dddetail .ddsignals .statmark,.dddetail .ddsignals .statmark.warn{background:#f3f1ee!important;color:#4f4b47!important;border:1px solid #e2ddd7!important}.dddetail>.ddback{display:none!important}.campus-route-hint{margin-left:6px;color:#6f6b67}.ddtrust .ddsignals{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid #e9e6df}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const info=t=>`<button type="button" class="fs-tip" aria-label="Come viene calcolato" data-tip="${esc(t)}" onclick="event.stopPropagation();this.classList.toggle('open')">i</button>`;
const euro=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Math.round(n));
function peers(x){const type=accommodationType(x);return state.items.filter(i=>i.city===x.city&&i.availability?.status!=='unavailable'&&(!type||accommodationType(i)===type))}
statisticalSignals=function(x){const out=[],p=peers(x).filter(i=>Number.isFinite(Number(i.price)));if(Number.isFinite(Number(x.price))&&p.length>=2){const avg=p.reduce((s,i)=>s+Number(i.price),0)/p.length,d=Number(x.price)-avg,a=Math.abs(Math.round(d)),label=Math.abs(d)<1?'≈ In linea con la media FUORISEDE':d<0?`📉 ${euro(a)} sotto la media FUORISEDE`:`📈 ${euro(a)} sopra la media FUORISEDE`;out.push(`${label} ${info(`Confronto con ${p.length} annunci di ${accommodationLabel(accommodationType(x))} attualmente presenti su FUORISEDE a ${x.city}. Media canone: ${euro(avg)} al mese. Non è una media dell'intero mercato.`)}`)}const c=peers(x).filter(i=>i.realMonthlyCostStatus==='complete'&&Number.isFinite(Number(i.realMonthlyCost)));if(x.realMonthlyCostStatus==='complete'&&Number.isFinite(Number(x.realMonthlyCost))&&c.length>=2){const avg=c.reduce((s,i)=>s+Number(i.realMonthlyCost),0)/c.length,d=Number(x.realMonthlyCost)-avg,a=Math.abs(Math.round(d)),label=Math.abs(d)<1?'🧾 Costo reale in linea con la media':d<0?`🧾 ${euro(a)} sotto la media costi reali`:`🧾 ${euro(a)} sopra la media costi reali`;out.push(`${label} ${info(`Calcolato sui ${c.length} annunci comparabili di ${x.city} con costo mensile completo. Media: ${euro(avg)} al mese.`)}`)}if(!out.length){const complete=[x.validation?.expensesDeclared,x.validation?.contractDeclared,x.validation?.utilitiesDeclared,Boolean(x.availability?.availableFrom)].filter(Boolean).length;out.push(complete===4?'✓ Dati chiave completi':`◔ ${complete}/4 dati chiave completi`)}return out.slice(0,3)};
signalClass=function(s){return /sopra la media|[0-3]\/4/i.test(String(s).replace(/<[^>]*>/g,''))?' warn':''};

/* Fix the actual generated detail markup before it reaches the page. */
const baseDetail=detailView;
detailView=function(x){
  const tpl=document.createElement('template');
  tpl.innerHTML=baseDetail(x);
  const detail=tpl.content.querySelector('.dddetail');
  if(!detail)return tpl.innerHTML;

  /* The right-hand availability warning is redundant: uncertainty is already shown in the relevant data row. */
  const sideAvailability=detail.querySelector('.ddaside .ddavailable');
  if(sideAvailability&&/^(da verificare|da riconfermare)$/i.test(sideAvailability.textContent.trim()))sideAvailability.remove();

  /* Statistical averages belong inside the white completeness/trust card, not below it. */
  const trust=detail.querySelector('.ddtrust');
  const signals=detail.querySelector('.ddsection .ddsignals');
  if(trust&&signals)trust.appendChild(signals);

  /* Remove duplicated uncertainty only when the same essential field repeats it immediately. */
  detail.querySelectorAll('.ddessentials>div').forEach(box=>{const b=box.querySelector('b'),s=box.querySelector('span');if(!b||!s)return;const a=b.textContent.trim().toLowerCase(),c=s.textContent.trim().toLowerCase();if(a===c&&/^(da verificare|da completare|da riconfermare)$/.test(a))s.remove()});
  return tpl.innerHTML;
};

function campusHint(){const d=document.querySelector('.dddetail');if(!d)return;const route=[...d.querySelectorAll('.ddsection')].find(s=>/da qui all.universit/i.test(s.querySelector('h2')?.textContent||''));if(!route||route.querySelector('.campus-route-hint'))return;const vals=[...route.querySelectorAll('.ddroute b')].map(x=>(x.textContent||'').trim().toLowerCase());if(vals.some(v=>v==='da verificare'||v==='da calcolare')){const h=route.querySelector('h2');if(h)h.insertAdjacentHTML('beforeend',`<button type="button" class="fs-tip campus-route-hint" aria-label="Informazioni sul calcolo" data-tip="Per calcolare distanza e tempo in bici devi prima selezionare la sede universitaria di riferimento." onclick="event.stopPropagation();this.classList.toggle('open')">i</button>`)}}
if(typeof state!=='undefined'&&state.detail!=null&&typeof render==='function')render();
campusHint();new MutationObserver(campusHint).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(!e.target.closest('.fs-tip'))document.querySelectorAll('.fs-tip.open').forEach(x=>x.classList.remove('open'))});
})();