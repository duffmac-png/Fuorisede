/* FUORISEDE pilot analytics
 * Isolated, dependency-free event collector for META-02.
 * Does not alter UI behaviour. Events are kept locally until a server endpoint
 * or analytics provider is configured.
 */
(function (w) {
  'use strict';

  var STORAGE_KEY = 'fuorisede_analytics_v1';
  var SESSION_KEY = 'fuorisede_session_v1';
  var VISITOR_KEY = 'fuorisede_visitor_v1';
  var dedupe = {};
  var allowed = {
    qualified_visit: true,
    listing_open: true,
    compare_start: true,
    favorite_add: true,
    listing_contact: true,
    partner_outbound: true
  };

  function sessionId() {
    try {
      var id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch (_) {
      return 'session-unavailable';
    }
  }

  function visitorId() {
    try {
      var id = localStorage.getItem(VISITOR_KEY);
      if (!id) {
        id = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(VISITOR_KEY, id);
      }
      return id;
    } catch (_) {
      return 'visitor-unavailable';
    }
  }

  function deviceType() {
    var ua = navigator.userAgent || '';
    if (/ipad|tablet/i.test(ua)) return 'tablet';
    if (/mobi|iphone|android/i.test(ua)) return 'mobile';
    return 'desktop';
  }

  function sendRemote(event) {
    if (w.FUORISEDE_VERSIONE !== 'produzione') return; /* le statistiche Airtable contano solo la versione online */
    try {
      fetch('/api/pilot-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({
          event: event.event,
          ts: event.ts,
          visitorId: visitorId(),
          session: event.session,
          listingId: event.listingId,
          source: [event.source, event.campaign].filter(Boolean).join(' / '),
          device: deviceType()
        })
      }).catch(function () {});
    } catch (_) {}
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch (_) { return []; }
  }

  function write(events) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-500))); }
    catch (_) {}
  }

  function track(name, data) {
    if (!allowed[name]) return false;
    data = data || {};
    var key = name + '|' + (data.listingId || '') + '|' + (data.count || '');
    var now = Date.now();
    if (dedupe[key] && now - dedupe[key] < 1500) return false;
    dedupe[key] = now;
    var events = read();
    events.push({
      event: name,
      ts: new Date().toISOString(),
      session: sessionId(),
      path: location.pathname,
      city: data.city || null,
      listingId: data.listingId || null,
      count: data.count || null,
      source: data.source || null,
      partner: data.partner || null,
      campaign: data.campaign || null
    });
    write(events);
    sendRemote(events[events.length - 1]);
    return true;
  }

  function summary() {
    var events = read();
    var out = { qualified_visit:0, listing_open:0, compare_start:0, favorite_add:0, listing_contact:0, partner_outbound:0 };
    var sessions = {};
    events.forEach(function (item) {
      if (allowed[item.event]) out[item.event] = (out[item.event] || 0) + 1;
      if (item.session) sessions[item.session] = true;
    });
    out.sessions = Object.keys(sessions).length;
    out.funnel = {
      visit_to_listing: out.qualified_visit ? +(100*out.listing_open/out.qualified_visit).toFixed(1) : 0,
      visit_to_compare: out.qualified_visit ? +(100*out.compare_start/out.qualified_visit).toFixed(1) : 0,
      visit_to_favorite: out.qualified_visit ? +(100*out.favorite_add/out.qualified_visit).toFixed(1) : 0,
      visit_to_contact: out.qualified_visit ? +(100*out.listing_contact/out.qualified_visit).toFixed(1) : 0,
      visit_to_partner: out.qualified_visit ? +(100*out.partner_outbound/out.qualified_visit).toFixed(1) : 0
    };
    return out;
  }

  w.FuorisedeAnalytics = {
    track: track,
    summary: summary,
    events: read,
    clear: function () { write([]); }
  };
})(window);
