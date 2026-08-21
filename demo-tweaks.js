// Miglioramenti esclusivi della demo: non modifica la UI di produzione.
(function(){
  const originalUpdateMap=window.updateMap;
  window.updateMap=function(items){
    if(!map)return;
    mapLayer.clearLayers();
    const bounds=[];
    const dirs=['top','right','bottom','left'];
    const offsets={top:[0,-9],right:[10,0],bottom:[0,9],left:[-10,0]};
    items.forEach((x,i)=>{
      if(!hasNum(x.lat)||!hasNum(x.lng))return;
      const marker=L.circleMarker([x.lat,x.lng],{radius:10,weight:3,color:'#fff',fillColor:'#a84d3f',fillOpacity:1});
      const d=dirs[i%dirs.length];
      marker.addTo(mapLayer)
        .bindTooltip(euro(x.price),{permanent:true,direction:d,offset:offsets[d],className:'listing-price-tooltip'})
        .bindPopup(`<b>${x.title}</b><br>${travel(x)}<br><b>${euro(x.price+x.expenses)} costo indicato/mese</b><br><button onclick="openListing(${x.id})" style="margin-top:8px;padding:8px 10px">Apri scheda</button>`);
      bounds.push([x.lat,x.lng]);
    });
    const mammut=items.some(x=>/Mammut/i.test(x.campus||''));
    if(mammut){const c=[44.8392,11.6264];L.circleMarker(c,{radius:8,weight:3,color:'#2463a7',fillColor:'#4b8fd8',fillOpacity:.9}).addTo(mapLayer).bindPopup('<b>Mammut · Polo sanitario</b><br>Sede di riferimento della ricerca');bounds.push(c)}
    map.invalidateSize();
    if(bounds.length===1)map.setView(bounds[0],15);else if(bounds.length>1)map.fitBounds(bounds,{padding:[70,70],maxZoom:15});
    setTimeout(()=>map&&map.invalidateSize(),150);
  };

  window.showComparison=function(){
    const xs=listings.filter(x=>compare.has(x.id));
    let m=document.getElementById('listing-modal')||document.createElement('div');
    m.id='listing-modal';m.style.cssText='position:fixed;inset:0;background:#0008;z-index:1300;display:grid;place-items:center;padding:8px';
    if(!m.parentNode)document.body.appendChild(m);
    const total=x=>x.expensesKnown===false?null:x.price+(x.expenses||0);
    const candidates=x=>x.candidates+(applications.has(x.id)?1:0);
    const rows=[
      {l:'Costo reale',v:x=>total(x)==null?'Da verificare':euro(total(x)),n:total,low:1,icon:'🏆',label:'TOP costo'},
      {l:'Percorrenza',v:x=>travel(x),n:x=>x.minutes,low:1,icon:'🎖️',label:'Più vicino'},
      {l:'Distanza',v:x=>distance(x),n:x=>x.km,low:1,icon:'⭐',label:'Top distanza'},
      {l:'Candidati',v:x=>candidates(x),n:candidates,low:1,icon:'👥',label:'Meno concorrenza'},
      {l:'Canone',v:x=>euro(x.price)},{l:'Spese',v:x=>x.expensesKnown===false?'Da verificare':euro(x.expenses||0)},
      {l:'Sede',v:x=>x.campus},{l:'Disponibilità',v:x=>x.available},{l:'Contratto',v:x=>x.contract||'—'},
      {l:'Deposito',v:x=>x.deposit||'—'},{l:'Utenze / spese',v:x=>x.utilities||'—'},{l:'Bagno',v:x=>x.bathroom||'—'},
      {l:'Coinquilini',v:x=>x.roommates==='0'?'Nessuno':x.roommates||'—'},{l:'Affidabilità',v:x=>trustLabel(x)}
    ];
    const badge=(r,x)=>{if(!r.n||xs.length<2)return'';const vals=xs.map(r.n);if(vals.some(v=>!Number.isFinite(v))||new Set(vals).size===1)return'';const best=r.low?Math.min(...vals):Math.max(...vals);return r.n(x)===best?`<span title="${r.label}" style="display:inline-flex;align-items:center;gap:3px;margin:4px 0 0;padding:3px 6px;border-radius:999px;background:#f6f0e7;border:1px solid #ead7cd;color:#a84d3f;font-size:10px;font-weight:900">${r.icon} ${r.label}</span>`:''};
    const cols=`31% repeat(${xs.length},minmax(0,1fr))`;
    m.innerHTML=`<section style="background:#fff;max-width:720px;width:100%;border-radius:18px;padding:14px 10px;box-shadow:0 18px 60px #0003"><div style="display:flex;justify-content:space-between;gap:8px;padding:0 6px"><div><small style="color:#a84d3f;font-weight:800">DECIDI CON DATI OMOGENEI</small><h2 style="margin:3px 0 10px;font-size:21px">Confronta gli alloggi</h2></div><button onclick="closeListing()" style="width:auto;background:transparent;color:#222;font-size:25px;padding:2px 8px">×</button></div><div style="display:grid;grid-template-columns:${cols};width:100%;font-size:12px;line-height:1.25;border:1px solid #e5ddd2;border-radius:12px;overflow:hidden"><div style="background:#f6f0e7"></div>${xs.map(x=>`<div style="padding:9px 5px;font-weight:800;overflow-wrap:anywhere;background:#f6f0e7;border-left:1px solid #e5ddd2">${x.title}</div>`).join('')}${rows.map((r,ri)=>`<div style="padding:9px 5px;border-top:1px solid #e5ddd2;font-weight:800;color:#5d5751;background:${ri%2?'#fff':'#fcfaf7'}">${r.l}</div>${xs.map(x=>`<div style="padding:9px 5px;border-top:1px solid #e5ddd2;border-left:1px solid #e5ddd2;overflow-wrap:anywhere;background:${ri%2?'#fff':'#fcfaf7'}">${r.v(x)}<br>${badge(r,x)}</div>`).join('')}`).join('')}</div><div style="font-size:11px;color:#6f6b67;padding:9px 5px 0">🏆 costo migliore · 🎖️ percorrenza migliore · ⭐ distanza migliore · 👥 meno candidature</div></section>`;
  };
})();
