/* FUORISEDE universal runtime fixes */

export function extractAvailabilityFromDescription(description, now = new Date('2026-08-25T12:00:00+02:00')) {
  const text = String(description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;

  const lower = text.toLowerCase();
  if (/liber[oa]\s+da\s+subito|disponibil[ei]\s+da\s+subito|disponibile\s+ora/.test(lower)) {
    const iso = now.toISOString().slice(0, 10);
    return { availableFrom: iso, availableLabel: 'Disponibile ora', status: 'declared', derivedFromText: true };
  }

  const numeric = lower.match(/(?:disponibil[ei]|liber[oa]|dal|da)\D{0,24}(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/i);
  if (numeric) {
    let [, d, m, y] = numeric;
    if (y.length === 2) y = `20${y}`;
    const iso = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return { availableFrom: iso, availableLabel: `Dal ${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`, status: 'declared', derivedFromText: true };
  }

  const months = { gennaio:1, febbraio:2, marzo:3, aprile:4, maggio:5, giugno:6, luglio:7, agosto:8, settembre:9, ottobre:10, novembre:11, dicembre:12 };
  const named = lower.match(/(?:disponibil[ei]|liber[oa]|dal|da|met[aà]|fine)\D{0,28}(?:(\d{1,2})\s+)?(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/i);
  if (named) {
    const day = named[1] ? Number(named[1]) : /fine\s/.test(named[0]) ? 25 : /met[aà]\s/.test(named[0]) ? 15 : 1;
    const month = months[named[2]];
    const year = named[3] ? Number(named[3]) : now.getFullYear();
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const label = named[1] ? `Dal ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` : /fine\s/.test(named[0]) ? `Da fine ${named[2]} ${year}` : /met[aà]\s/.test(named[0]) ? `Metà ${named[2]} ${year}` : `Da ${named[2]} ${year}`;
    return { availableFrom: iso, availableLabel: label, status: 'declared', derivedFromText: true };
  }

  return null;
}

export function normalizeAvailability(listing, now) {
  const current = listing?.availability || {};
  if (current.availableFrom || (current.availableLabel && !/verificare|riconfermare/i.test(current.availableLabel))) return listing;
  const inferred = extractAvailabilityFromDescription(listing?.details?.description, now);
  if (!inferred) return listing;
  return { ...listing, availability: { ...current, ...inferred } };
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const r = 6371;
  const p = Math.PI / 180;
  const dLat = (lat2 - lat1) * p;
  const dLng = (lng2 - lng1) * p;
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(q));
}

export function applyCampusReference(listing, campusId, campus) {
  if (!campusId || !campus || !Number.isFinite(listing?.lat) || !Number.isFinite(listing?.lng)) return listing;
  const km = haversineKm(listing.lat, listing.lng, campus.lat, campus.lng) * 1.18;
  return {
    ...listing,
    campusReference: {
      campusId,
      campusName: campus.name,
      distanceKm: Number(km.toFixed(1)),
      minutesBike: Math.max(2, Math.round((km / 15) * 60)),
      travelEstimate: true,
    },
  };
}
