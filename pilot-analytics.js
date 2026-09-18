/* FUORISEDE pilot analytics
 * Isolated, dependency-free event collector for META-02.
 * Does not alter UI behaviour. Events are kept locally until a server endpoint
 * or analytics provider is configured.
 */
(function (w) {
  'use strict';

  var STORAGE_KEY = 'fuorisede_analytics_v1';
  var SESSION_KEY = 'fuorisede_session_v1';
  var allowed = {
    qualified_visit: true,
    listing_open: true,
    compare_start: true,
    favorite_add: true,
    listing_contact: true
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
    var events = read();
    events.push({
      event: name,
      ts: new Date().toISOString(),
      session: sessionId(),
      path: location.pathname,
      city: data && data.city || null,
      listingId: data && data.listingId || null,
      count: data && data.count || null,
      source: data && data.source || null
    });
    write(events);
    return true;
  }

  function summary() {
    return read().reduce(function (out, item) {
      out[item.event] = (out[item.event] || 0) + 1;
      return out;
    }, {});
  }

  w.FuorisedeAnalytics = {
    track: track,
    summary: summary,
    events: read,
    clear: function () { write([]); }
  };
})(window);
