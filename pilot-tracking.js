/* FUORISEDE — eventi del funnel (2026-09-24)
 * Registra le azioni che contano, agganciandosi alle funzioni del sito (non ai nomi delle classi,
 * che cambiano con il design). Gli eventi passano da pilot-analytics.js → /api/pilot-event → Airtable.
 *
 *   qualified_visit   visita (una per caricamento pagina), con provenienza utm_source / utm_campaign
 *   listing_open      apertura di una Scheda
 *   favorite_add      aggiunta ai preferiti
 *   compare_start     apertura del Confronto (con numero di alloggi)
 *   partner_outbound  clic su "Apri l'annuncio originale"
 *   listing_contact   clic su "Richiedi integrazione" / "Avvisami sugli aggiornamenti"
 */
(function () {
  'use strict';

  const A = () => window.FuorisedeAnalytics;
  const KEY = 'fuorisede_source_v1';

  // Provenienza: salvata per tutta la sessione, così anche le azioni successive restano attribuite a "meta".
  function origin() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (saved) return saved;
    } catch (_) {}
    const q = new URLSearchParams(location.search);
    let source = q.get('utm_source');
    if (!source && q.get('fbclid')) source = 'facebook';
    if (!source && document.referrer) {
      try {
        const host = new URL(document.referrer).hostname;
        if (host && host !== location.hostname) source = host.replace(/^www\./, '');
      } catch (_) {}
    }
    const value = { source: source || 'diretto', campaign: q.get('utm_campaign') || null };
    try { sessionStorage.setItem(KEY, JSON.stringify(value)); } catch (_) {}
    return value;
  }

  function track(event, extra) {
    const a = A();
    if (!a) return;
    const o = origin();
    a.track(event, Object.assign({ city: 'Ferrara', source: o.source, campaign: o.campaign }, extra || {}));
  }

  function install() {
    if (typeof state === 'undefined' || typeof openDetail !== 'function') return false;

    // Le funzioni del sito sono globali ma dichiarate con function/let: si riassegnano per nome.
    const baseOpenDetail = openDetail;
    openDetail = function (id) {
      try { track('listing_open', { listingId: String(id) }); } catch (_) {}
      return baseOpenDetail.apply(this, arguments);
    };

    if (typeof toggleFav === 'function') {
      const baseToggleFav = toggleFav;
      toggleFav = function (id) {
        try { if (!state.favs.has(Number(id))) track('favorite_add', { listingId: String(id) }); } catch (_) {}
        return baseToggleFav.apply(this, arguments);
      };
    }

    if (typeof openComparison === 'function') {
      const baseOpenComparison = openComparison;
      openComparison = function () {
        try { track('compare_start', { count: state.selected.size }); } catch (_) {}
        return baseOpenComparison.apply(this, arguments);
      };
    }

    document.addEventListener('click', function (e) {
      const el = e.target.closest && e.target.closest('a,button');
      if (!el) return;
      const id = state.detail != null ? String(state.detail) : null;
      const text = (el.textContent || '').toLowerCase();
      if (el.matches('a.ddoriginal') || /annuncio originale/.test(text)) {
        let partner = null;
        try { partner = new URL(el.href).hostname.replace(/^www\./, ''); } catch (_) {}
        track('partner_outbound', { listingId: id, partner });
      } else if (/richiedi integrazione|avvisami sugli aggiornamenti/.test(text)) {
        track('listing_contact', { listingId: id });
      }
    }, true);

    track('qualified_visit');
    return true;
  }

  if (!install()) {
    let tries = 0;
    const t = setInterval(function () { if (install() || ++tries > 100) clearInterval(t); }, 50);
  }
})();
