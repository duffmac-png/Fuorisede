/* Controllo anti-regressione della mappa.
 * Uso: apri il sito, vai su "Mappa", incolla questo file nella console del browser.
 * Deve stampare "MAPPA OK". Se stampa "MAPPA KO", un errore già risolto è tornato. */
(function () {
  const ctx = activeMapMarkers.get('demo-map');
  if (!ctx) return console.error('MAPPA KO: mappa non aperta');
  const M = document.querySelector('#demo-map').getBoundingClientRect();
  const pills = [...document.querySelectorAll('#demo-map .listing-price-tooltip')];
  const visible = pills.filter(e => { const b = e.getBoundingClientRect(); return b.right > M.left && b.left < M.right && b.bottom > M.top && b.top < M.bottom; });
  const errors = [];
  if (pills.length !== ctx.markers.size) errors.push(`pillole ${pills.length} ≠ alloggi ${ctx.markers.size} (un alloggio è senza pillola)`);
  if (document.querySelector('.fscluster')) errors.push('ricomparsi i cluster "+N"');
  const r = visible.map(e => e.getBoundingClientRect());
  for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) {
    const a = r[i], b = r[j];
    if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) errors.push(`pillole sovrapposte: "${visible[i].textContent}" e "${visible[j].textContent}"`);
  }
  pills.filter(e => /—/.test(e.textContent) && !e.querySelector('.verifyinfo')).forEach(e => errors.push(`pillola senza prezzo senza icona "i": ${e.textContent}`));
  if (errors.length) console.error('MAPPA KO\n- ' + errors.join('\n- '));
  else console.log(`MAPPA OK: ${pills.length} pillole, nessuna sovrapposizione, zoom ${ctx.map.getZoom()}`);
})();
