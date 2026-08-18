const state={items:[],selected:new Set()};
const euro=n=>n==null?"Da verificare":new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
const fmtDate=s=>{if(!s)return null;const d=new Date(`${s}T12:00:00`);return new Intl.DateTimeFormat("it-IT",{day:"numeric",month:"long",year:"numeric"}).format(d)};
const availabilityText=x=>x.availability?.availableLabel||fmtDate(x.availability?.availableFrom)||"Da verificare";
const statusText=x=>({confirmed:"Confermata",to_reconfirm:"Da riconfermare",unavailable:"Non disponibile",unknown:"Da riconfermare"}[x.availability?.status]||"Da riconfermare");
const yesno=v=>v?"Sì":"Da verificare";
const costText=x=>x.realMonthlyCostStatus==="complete"?euro(x.realMonthlyCost):x.realMonthlyCostStatus==="minimum_known"?`almeno ${euro(x.realMonthlyCost)}`:"Da verificare";
function render(){
 const root=document.getElementById("v2-root"); if(!root)return;
 root.innerHTML=`<section class="panel"><h2 class="section-title">Schede V2 pilota</h2><p class="note">Dataset interno: le schede non autorizzate restano escluse dalla pubblicazione reale.</p></section>`+state.items.map(x=>`
 <section class="card">
  <div class="eyebrow">${x.city} · prototipo V2</div><div class="title">${x.title}</div>
  <div class="price">${euro(x.price)} <span class="muted">/ mese</span></div>
  <div><span class="badge warn">Costo ${costText(x)}</span><span class="badge warn">${statusText(x.availability)}</span></div>
  <div class="row"><span>Disponibile dal</span><strong>${availabilityText(x)}</strong></div>
  <div class="row"><span>Ultima conferma</span><strong class="unknown">${x.availability?.confirmedAt?fmtDate(x.availability.confirmedAt):"Da riconfermare"}</strong></div>
  <div class="row"><span>Pubblicazione autorizzata</span><strong class="${x.publication?.authorized?"good":"unknown"}">${x.publication?.authorized?"Sì":"No"}</strong></div>
  <div class="row"><span>Canone dichiarato</span><strong>${yesno(x.validation?.priceDeclared)}</strong></div>
  <div class="row"><span>Spese</span><strong class="${x.validation?.expensesDeclared?"good":"unknown"}">${yesno(x.validation?.expensesDeclared)}</strong></div>
  <div class="row"><span>Utenze</span><strong class="${x.validation?.utilitiesDeclared?"good":"unknown"}">${yesno(x.validation?.utilitiesDeclared)}</strong></div>
  <div class="row"><span>Sede di riferimento</span><strong>${x.campusReference?.campusName||"Da scegliere"}</strong></div>
  <label class="note" style="display:flex;gap:8px;align-items:center;margin-top:12px"><input type="checkbox" style="width:auto" ${state.selected.has(x.id)?"checked":""} onchange="toggleCompare('${x.id}',this.checked)"> Aggiungi al confronto</label>
 </section>`).join("")+comparison();
}
function toggleCompare(id,on){const key=Number.isNaN(Number(id))?id:Number(id);on?state.selected.add(key):state.selected.delete(key);if(state.selected.size>3){state.selected.delete(key);alert("Puoi confrontare fino a 3 alloggi.");}render();}
function comparison(){const xs=state.items.filter(x=>state.selected.has(x.id));if(xs.length<2)return"";const row=(label,fn)=>`<div class="row"><span>${label}</span><strong>${xs.map(fn).join(" · ")}</strong></div>`;return `<section class="panel"><h2 class="section-title">Confronto V2</h2>${row("Costo mensile",costText)}${row("Disponibilità",availabilityText)}${row("Ultima conferma",x=>x.availability?.confirmedAt?fmtDate(x.availability.confirmedAt):"da riconfermare")}${row("Sede",x=>x.campusReference?.campusName||"—")}${row("Spese",x=>x.validation?.expensesDeclared?"dichiarate":"da verificare")}${row("Autorizzazione",x=>x.publication?.authorized?"sì":"no")}</section>`;}
async function init(){try{const r=await fetch("../data/listings-v2-pilot.json",{cache:"no-store"});state.items=await r.json();render()}catch(e){document.getElementById("v2-root").innerHTML='<section class="panel"><b>Dataset V2 non disponibile.</b></section>';console.error(e)}}
init();