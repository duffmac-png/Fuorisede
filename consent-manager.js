/* FUORISEDE consent manager
 * Prepared 17/09/2026 for future non-technical measurement/marketing tools.
 * IMPORTANT: inactive by default. No marketing tag must be loaded outside
 * the explicit consent callback below.
 */
(function () {
  'use strict';

  const CONFIG = {
    enabled: false,
    storageKey: 'fuorisede_consent_v1'
  };

  window.FUORISEDE_CONSENT = {
    config: CONFIG,
    get: function () {
      try { return JSON.parse(localStorage.getItem(CONFIG.storageKey) || 'null'); }
      catch (_) { return null; }
    },
    acceptMarketing: function () {
      if (!CONFIG.enabled) return false;
      const value = { technical: true, marketing: true, savedAt: new Date().toISOString() };
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('fuorisede:consent', { detail: value }));
      return true;
    },
    rejectMarketing: function () {
      if (!CONFIG.enabled) return false;
      const value = { technical: true, marketing: false, savedAt: new Date().toISOString() };
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(value));
      window.dispatchEvent(new CustomEvent('fuorisede:consent', { detail: value }));
      return true;
    },
    revoke: function () {
      localStorage.removeItem(CONFIG.storageKey);
      window.dispatchEvent(new CustomEvent('fuorisede:consent-revoked'));
    }
  };

  // Intentionally no banner and no tracking code while CONFIG.enabled === false.
  // Before enabling: add UI with equally accessible Accept/Reject choices,
  // preference/revocation control, then load each non-technical tag ONLY after
  // an explicit marketing:true consent event or previously stored consent.
})();
