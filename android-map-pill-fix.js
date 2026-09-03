/* FUORISEDE Android controller — 20260903G
 * One owner for the mobile map card, active marker and comparison dock.
 */
(() => {
  'use strict';

  const forcedTest = () => new URLSearchParams(location.search).has('__android_test');
  const mobile = () => forcedTest() || matchMedia('(max-width:700px), (pointer:coarse)').matches;
  if (forcedTest()) document.documentElement.classList.add('fs-android-test');
  let activeId = null;
  let installToken = 0;
  const initializedCanvases = new WeakSet();
  const pillBoundCanvases = new WeakSet();

  document.head.insertAdjacentHTML('beforeend', `<style>
    .fs-mobile-map-card{display:none}
    @media(max-width:700px),(pointer:coarse){
      body.fs-map-mobile{padding-bottom:0}
      .v3nav{position:relative!important;top:auto!important;display:flex!important;flex-wrap:nowrap!important;overflow-x:auto!important;margin:0 0 18px!important}
      .mapzoomhint{display:none!important}
      .mapcanvas{position:relative!important;overflow:hidden!important}
      .listing-price-tooltip{pointer-events:auto!important;cursor:pointer!important;touch-action:manipulation!important;z-index:900!important;font-size:10px!important;padding:4px 7px!important}
      .listing-price-tooltip.mobile-price-hidden{opacity:1!important;visibility:visible!important;pointer-events:auto!important}
      .leaflet-control-attribution{max-width:72vw!important;font-size:7px!important}
      .fs-mobile-map-card{position:fixed;z-index:1900;left:12px;right:12px;bottom:max(72px,calc(env(safe-area-inset-bottom) + 64px));display:none;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 13px;border:1px solid #d9d7d1;border-radius:16px;background:#fff;color:#171715;box-shadow:0 12px 34px #0003}
      .fs-mobile-map-card.visible{display:grid}
      .fs-mobile-map-card-copy{min-width:0}
      .fs-mobile-map-card-copy small,.fs-mobile-map-card-copy strong,.fs-mobile-map-card-copy b{display:block}
      .fs-mobile-map-card-copy small{color:#716e69;font-size:8px;text-transform:uppercase}
      .fs-mobile-map-card-copy strong{margin:3px 0;font-size:12px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .fs-mobile-map-card-copy b{font-size:14px}
      .fs-mobile-map-actions{display:grid;gap:6px}
      .fs-mobile-map-actions button{min-width:104px;border:1px solid #171715;border-radius:999px;padding:8px 10px;background:#fff;color:#171715;font-size:9px;font-weight:800}
      .fs-mobile-map-actions .fs-open{background:#171715;color:#fff}
      .fs-mobile-map-actions .active{background:#f1f1ee}
      body.fs-map-mobile .leaflet-popup{display:none!important}
      body.fs-map-mobile .comparedock{z-index:2000!important}
      .fs-mobile-map-card.has-dock{bottom:max(154px,calc(env(safe-area-inset-bottom) + 146px))!important}
      .photoviewer{left:0!important;right:auto!important;width:100vw!important;max-width:100vw!important;overflow:hidden!important;grid-template-columns:34px minmax(0,calc(100vw - 80px)) 34px!important;padding-left:6px!important;padding-right:6px!important}
      .photoviewer figure{width:100%!important;max-width:100%!important;overflow:hidden!important}
      .photoviewer figure>img{width:100%!important;max-width:100%!important;height:auto!important;object-fit:contain!important}
      .photothumbs{max-width:100%!important}
    }
    html.fs-android-test .v3nav{position:relative!important;top:auto!important}
    html.fs-android-test .fs-mobile-map-card{position:fixed;z-index:1900;left:12px;right:12px;bottom:72px;display:none;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 13px;border:1px solid #d9d7d1;border-radius:16px;background:#fff;color:#171715;box-shadow:0 12px 34px #0003}
    html.fs-android-test .fs-mobile-map-card.visible{display:grid}
    html.fs-android-test body.fs-map-mobile .leaflet-popup{display:none!important}
  </style>`);

  const listing = id => state.items.find(item => Number(item.id) === Number(id));
  const card = () => document.querySelector('.fs-mobile-map-card');
  const dock = () => document.querySelector('.comparedock');

  function ensureCard() {
    let node = card();
    if (node) return node;
    node = document.createElement('section');
    node.className = 'fs-mobile-map-card';
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-label', 'Alloggio selezionato sulla mappa');
    document.body.appendChild(node);
    return node;
  }

  function positionCard() {
    const node = card();
    if (!node || !node.classList.contains('visible')) return;
    const comparisonDock = dock();
    node.classList.toggle('has-dock', Boolean(comparisonDock));
    const bottom = comparisonDock
      ? Math.max(72, Math.ceil(innerHeight - comparisonDock.getBoundingClientRect().top + 12))
      : Math.max(72, 64 + (Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-bottom')) || 0));
    node.style.bottom = `${bottom}px`;
    node.style.maxHeight = `${Math.max(110, innerHeight - bottom - 76)}px`;
  }

  function rebuildDock() {
    document.querySelectorAll('.comparedock').forEach(node => node.remove());
    if (state.selected.size >= 2 && state.view === 'map' && !state.detail && !state.compareOpen) {
      document.body.insertAdjacentHTML('beforeend', compareDock());
    }
    requestAnimationFrame(positionCard);
    [50, 180, 400].forEach(delay => setTimeout(positionCard, delay));
  }

  function refreshMarkers() {
    const context = window.activeMapMarkers?.get('demo-map');
    if (!context) return;
    context.markers.forEach(({marker, x}, key) => {
      const numericKey = Number(key);
      marker.setStyle(markerAppearance(x, numericKey === activeId));
      marker.setTooltipContent(`${state.favs.has(numericKey) ? '♥ ' : ''}${state.selected.has(numericKey) ? '★ ' : ''}${euro(x.price)}`);
      if (numericKey === activeId) marker.bringToFront();
      else if (state.selected.has(numericKey)) marker.bringToBack();
    });
    arrangeMapPriceLabels?.('demo-map');
  }

  function showCard(id) {
    const item = listing(id);
    if (!item || state.view !== 'map') return;
    activeId = Number(id);
    state.mapActiveListingId = activeId;
    document.querySelectorAll('.mapmini.active').forEach(node => node.classList.remove('active'));
    document.getElementById(`map-mini-${activeId}`)?.classList.add('active');
    window.activeMapMarkers?.get('demo-map')?.map.closePopup();
    const selected = state.selected.has(activeId);
    const node = ensureCard();
    node.innerHTML = `<div class="fs-mobile-map-card-copy"><small>${item.city} · ${campusShort(item)}</small><strong>${item.title}</strong><b>${euro(item.price)} <span class="muted">/ mese</span></b></div><div class="fs-mobile-map-actions"><button class="fs-open" type="button">Apri la scheda</button><button class="fs-compare ${selected ? 'active' : ''}" type="button">${selected ? '✓ Nel confronto' : 'Confronta'}</button></div>`;
    node.querySelector('.fs-open').onclick = () => openDetail(activeId);
    node.querySelector('.fs-compare').onclick = () => toggleMapComparison(activeId);
    node.classList.add('visible');
    refreshMarkers();
    positionCard();
  }

  function compatible(candidate) {
    if (!state.selected.size) return true;
    const first = state.items.find(item => state.selected.has(Number(item.id)));
    const required = accommodationType(first);
    if (required && accommodationType(candidate) === required) return true;
    alert(`Puoi confrontare solo ${accommodationLabel(required)} con ${accommodationLabel(required)}.`);
    return false;
  }

  function toggleMapComparison(id) {
    const key = Number(id);
    const candidate = listing(key);
    if (!candidate) return;
    if (state.selected.has(key)) {
      state.selected.delete(key);
      state.mapExplicitlyRemoved?.add(key);
    } else {
      if (state.selected.size >= 3) {
        alert('Puoi confrontare fino a 3 alloggi.');
        return;
      }
      if (!compatible(candidate)) return;
      state.mapExplicitlyRemoved?.delete(key);
      state.selected.add(key);
    }
    if (state.selected.size < 2) state.compareOpen = false;
    showCard(key);
    rebuildDock();
  }

  function clearMapUi() {
    activeId = null;
    state.mapActiveListingId = null;
    document.body.classList.toggle('fs-map-mobile', mobile() && state.view === 'map');
    document.querySelectorAll('.mapmini.active').forEach(node => node.classList.remove('active'));
    const node = ensureCard();
    node.classList.remove('visible');
    node.innerHTML = '';
    window.activeMapMarkers?.get('demo-map')?.map.closePopup();
  }

  function installMapController(token, tries = 0) {
    if (token !== installToken || !mobile() || state.view !== 'map') return;
    const context = window.activeMapMarkers?.get('demo-map');
    const canvas = document.getElementById('demo-map');
    if (!context || !canvas || context.map.getContainer() !== canvas) {
      if (tries < 40) setTimeout(() => installMapController(token, tries + 1), 100);
      return;
    }
    document.body.classList.add('fs-map-mobile');
    if (!initializedCanvases.has(canvas)) {
      initializedCanvases.add(canvas);
      clearMapUi();
    }
    context.markers.forEach(({marker, x}) => {
      marker.off('click');
      marker.on('click', () => showCard(Number(x.id)));
      marker.closePopup();
      marker.unbindPopup();
    });
    if (!pillBoundCanvases.has(canvas)) {
      pillBoundCanvases.add(canvas);
      let lastPointerUp = 0;
      const activatePill = event => {
        const pill = event.target.closest?.('.listing-price-tooltip');
        if (!pill || !canvas.contains(pill)) return;
        if (event.type === 'click' && performance.now() - lastPointerUp < 500) return;
        if (event.type === 'pointerup') lastPointerUp = performance.now();
        const entry = [...context.markers.values()].find(({marker}) => marker.getTooltip()?.getElement() === pill);
        if (!entry) return;
        event.preventDefault();
        event.stopPropagation();
        showCard(Number(entry.x.id));
      };
      canvas.addEventListener('pointerup', activatePill, true);
      canvas.addEventListener('click', activatePill, true);
    }
    document.querySelectorAll('.mapmini').forEach(node => {
      node.onclick = event => {
        event.preventDefault();
        showCard(Number(node.id.replace('map-mini-', '')));
      };
    });
    refreshMarkers();
    rebuildDock();
  }

  const originalSetView = setView;
  setView = function(view) {
    if (mobile() && view === 'map') clearMapUi();
    originalSetView(view);
    installToken += 1;
    if (mobile() && view === 'map') {
      const token = installToken;
      [0, 300, 1000].forEach(delay => setTimeout(() => installMapController(token), delay));
    }
    else document.body.classList.remove('fs-map-mobile');
  };

  const originalRender = render;
  render = function() {
    originalRender();
    installToken += 1;
    if (mobile() && state.view === 'map' && !state.detail && !state.compareOpen) {
      const token = installToken;
      [0, 300, 1000].forEach(delay => setTimeout(() => installMapController(token), delay));
    } else {
      card()?.classList.remove('visible');
      document.body.classList.remove('fs-map-mobile');
    }
  };

  window.scrollFuorisedeTop = function() {
    const forceTop = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    };
    document.querySelector('.top')?.scrollIntoView({block: 'start'});
    forceTop();
    requestAnimationFrame(forceTop);
    [100, 350, 800].forEach(delay => setTimeout(forceTop, delay));
  };

  const originalDetailView = detailView;
  detailView = function(item) {
    return originalDetailView(item).replaceAll("window.scrollTo({top:0,behavior:'smooth'})", 'scrollFuorisedeTop()');
  };

  addEventListener('resize', positionCard, {passive: true});
  addEventListener('orientationchange', () => setTimeout(positionCard, 150), {passive: true});
})();
