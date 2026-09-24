/* FUORISEDE — pillole prezzo sulla mappa (2026-09-24)
 * Regole (vedi REGRESSIONI.md):
 *  - ogni alloggio ha sempre la sua pillola ("429 €" oppure "— € ⓘ"), niente cluster "+N";
 *  - le pillole non si sovrappongono mai: se servirebbe, la pillola viene spostata
 *    e collegata al punto esatto con una linea sottile grigia;
 *  - ogni pillola è cliccabile e apre il popup del suo alloggio (desktop).
 *    Su mobile il click è già gestito da android-map-pill-fix.js.
 */
(function () {
  'use strict';

  const GAP = 3;            // spazio minimo tra due pillole (px)
  const ARROW = 6;          // la freccetta sotto la pillola (margin-top Leaflet)
  const isMobile = () => matchMedia('(max-width:700px), (pointer:coarse)').matches;

  function boxesOverlap(a, b) {
    return a.x1 < b.x2 + GAP && a.x2 + GAP > b.x1 && a.y1 < b.y2 + GAP && a.y2 + GAP > b.y1;
  }
  function overlapArea(a, b) {
    const w = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1);
    const h = Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1);
    return w > 0 && h > 0 ? w * h : 0;
  }

  // Posizioni candidate attorno al punto, dalla più vicina alla più lontana, preferendo l'alto.
  const CANDIDATES = (() => {
    const out = [[0, 0]];
    const dirs = [];
    for (let i = 0; i < 24; i++) {
      const a = -Math.PI / 2 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * (Math.PI / 12);
      dirs.push([Math.cos(a), Math.sin(a)]);
    }
    [16, 26, 38, 50, 64, 80, 98, 118, 140, 165, 195, 230, 270].forEach(r => dirs.forEach(([c, s]) => out.push([Math.round(c * r * 1.35), Math.round(s * r)])));
    return out;
  })();

  function layoutPills(id) {
    const ctx = typeof activeMapMarkers !== 'undefined' && activeMapMarkers.get(id);
    if (!ctx || !ctx.map || !ctx.markers) return;
    const map = ctx.map;
    if (!ctx.pillLines) ctx.pillLines = L.layerGroup().addTo(map);
    ctx.pillLines.clearLayers();

    const entries = [...ctx.markers.values()].filter(e => map.hasLayer(e.marker) && e.marker.getTooltip && e.marker.getTooltip());
    if (!entries.length) return;

    // I punti degli alloggi sono ostacoli: una pillola non deve coprire il pallino di un altro alloggio.
    const dots = entries.map(e => {
      const p = map.latLngToContainerPoint(e.marker.getLatLng());
      const r = (e.marker.getRadius ? e.marker.getRadius() : 10) + 1;
      return { e, p, box: { x1: p.x - r, y1: p.y - r, x2: p.x + r, y2: p.y + r } };
    });

    // Priorità: alloggio attivo, poi quelli nel confronto, poi dall'alto verso il basso.
    const rank = e => {
      const key = Number(e.x.id);
      if (state.mapActiveListingId === key) return 0;
      if (state.selected && state.selected.has(key)) return 1;
      return 2;
    };
    dots.sort((a, b) => rank(a.e) - rank(b.e) || a.p.y - b.p.y || a.p.x - b.p.x);

    const size = map.getSize();
    const outside = b => b.x1 < 2 || b.y1 < 2 || b.x2 > size.x - 2 || b.y2 > size.y - 2;
    const placed = [];
    dots.forEach(d => {
      const tip = d.e.marker.getTooltip();
      const el = tip.getElement && tip.getElement();
      if (!el) return;
      if (!tip._fsBaseOffset) tip._fsBaseOffset = L.point(tip.options.offset || [0, 0]);
      const base = tip._fsBaseOffset;
      const w = el.offsetWidth, h = el.offsetHeight;
      const boxAt = (dx, dy) => {
        const cx = d.p.x + base.x + dx, bottom = d.p.y + base.y + dy - ARROW;
        return { x1: cx - w / 2, x2: cx + w / 2, y1: bottom - h, y2: bottom };
      };
      const others = dots.filter(o => o !== d).map(o => o.box);
      const inView = d.p.x >= 0 && d.p.y >= 0 && d.p.x <= size.x && d.p.y <= size.y;
      let best = null, bestScore = Infinity;
      for (const [dx, dy] of CANDIDATES) {
        const box = boxAt(dx, dy);
        const hits = placed.concat(others);
        const out = inView && outside(box);
        if (!out && !hits.some(o => boxesOverlap(box, o))) { best = [dx, dy, box]; break; }
        const score = hits.reduce((s, o) => s + overlapArea(box, o), 0) + (out ? 5000 : 0);
        if (score < bestScore) { bestScore = score; best = [dx, dy, box]; }
      }
      const [dx, dy, box] = best;
      placed.push(box);
      tip.options.offset = L.point(base.x + dx, base.y + dy);
      // Solo riposizionamento: update() riscriverebbe il contenuto (e toglierebbe l'icona "i").
      if (tip._updatePosition) tip._updatePosition(); else tip.update();
      const moved = dx !== 0 || dy !== 0;
      el.classList.toggle('fs-pill-moved', moved);
      if (moved) {
        // Linea dal pallino al bordo più vicino della pillola.
        const tx = Math.max(box.x1, Math.min(d.p.x, box.x2));
        const ty = Math.max(box.y1, Math.min(d.p.y, box.y2));
        L.polyline([d.e.marker.getLatLng(), map.containerPointToLatLng([tx, ty])], {
          color: '#8d8780', weight: 1, opacity: 0.9, interactive: false
        }).addTo(ctx.pillLines);
      }
    });
  }
  window.layoutMapPills = layoutPills;

  let pending = null;
  function scheduleLayout(id) {
    clearTimeout(pending);
    pending = setTimeout(() => layoutPills(id), 60);
  }

  // android-map-pill-fix.js chiama arrangeMapPriceLabels dopo aver aggiornato le pillole su mobile:
  // prima non esisteva e generava un errore JavaScript.
  window.arrangeMapPriceLabels = id => scheduleLayout(id || 'demo-map');

  const baseInitMap = initMap;
  initMap = function (id = 'demo-map', items = state.items, attempt = 0) {
    baseInitMap(id, items, attempt);
    let tries = 0;
    const bind = () => {
      const ctx = activeMapMarkers.get(id);
      if (!ctx || !ctx.map || !ctx.markers || !ctx.markers.size) {
        if (tries++ < 40) setTimeout(bind, 100);
        return;
      }
      if (!ctx.fsPillsBound) {
        ctx.fsPillsBound = true;
        ctx.map.on('zoomend resize', () => scheduleLayout(id));
        // Se il testo di una pillola cambia (confronto, preferiti, icona "i"), la sua larghezza cambia: ricalcola.
        const pane = ctx.map.getPane('tooltipPane');
        if (pane) new MutationObserver(() => scheduleLayout(id)).observe(pane, { childList: true, subtree: true, characterData: true });
      }
      [0, 300, 900].forEach(t => setTimeout(() => layoutPills(id), t));
    };
    setTimeout(bind, 50);
  };

  // Quando cambia il contenuto di una pillola (confronto, icona "i"), ricalcola.
  const baseCompare = typeof mapCompareAction === 'function' ? mapCompareAction : null;
  if (typeof baseCompare === 'function') {
    mapCompareAction = function (id) {
      baseCompare(id);
      scheduleLayout('demo-map');
    };
  }

  // Click sulla pillola = click sul pallino (desktop). Su mobile gestisce android-map-pill-fix.js.
  document.addEventListener('click', event => {
    if (isMobile() || typeof activeMapMarkers === 'undefined') return;
    const pill = event.target.closest && event.target.closest('.listing-price-tooltip');
    if (!pill || event.target.closest('.verifyinfo')) return;
    for (const ctx of activeMapMarkers.values()) {
      if (!ctx || !ctx.markers) continue;
      for (const entry of ctx.markers.values()) {
        if (entry.marker.getTooltip && entry.marker.getTooltip() && entry.marker.getTooltip().getElement() === pill) {
          event.preventDefault();
          event.stopPropagation();
          entry.marker.fire('click');
          return;
        }
      }
    }
  }, true);

  document.head.insertAdjacentHTML('beforeend', `<style id="fs-map-pills">
.listing-price-tooltip{pointer-events:auto!important;cursor:pointer!important;white-space:nowrap}
.listing-price-tooltip.fs-pill-moved:before{display:none!important}
.listing-price-tooltip .verifyinfo{width:13px;height:13px;font-size:9px;margin-left:4px}
@media(max-width:700px){
  .mapworkspace{display:flex!important;flex-direction:column!important;gap:10px!important;height:auto!important}
  .mapworkspace>.mapcanvas{order:1;width:100%!important;height:auto!important}
  .mapworkspace #demo-map{height:62vh!important;min-height:360px}
  .mapworkspace>.mapminilist{order:2;display:flex!important;flex-direction:row!important;align-items:stretch!important;overflow-x:auto!important;overflow-y:hidden!important;max-height:none!important;height:auto!important;gap:10px!important;padding:0 0 6px!important;scroll-snap-type:x mandatory}
  .mapworkspace>.mapminilist>.mapmini{flex:0 0 78%!important;height:auto!important;scroll-snap-align:start}
}
</style>`);
})();
