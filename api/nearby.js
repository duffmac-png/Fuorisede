function distanceKm(aLat, aLng, bLat, bLng) {
  const rad = value => value * Math.PI / 180, earth = 6371;
  const dLat = rad(bLat - aLat), dLng = rad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return earth * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

const categories = [
  ['Supermercato', tags => tags.shop === 'supermarket'],
  ['Farmacia', tags => tags.amenity === 'pharmacy'],
  ['Fermata autobus', tags => tags.highway === 'bus_stop' || tags.public_transport === 'platform'],
  ['Palestra', tags => tags.leisure === 'fitness_centre' || tags.sport === 'fitness'],
  ['Bar / caffetteria', tags => ['bar', 'cafe'].includes(tags.amenity)],
  ['Cinema', tags => tags.amenity === 'cinema']
];

export default async function handler(req, res) {
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: 'Coordinate non valide' });
  try {
    const query = `[out:json][timeout:12];(nwr(around:1200,${lat},${lng})[shop=supermarket];nwr(around:1200,${lat},${lng})[amenity=pharmacy];nwr(around:1200,${lat},${lng})[highway=bus_stop];nwr(around:1200,${lat},${lng})[leisure=fitness_centre];nwr(around:1200,${lat},${lng})[amenity~"^(bar|cafe|cinema)$"];);out center tags;`;
    let response;
    for (const endpoint of ['https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter']) {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 9000);
      try {
        const candidate = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'FUORISEDE/1.0 nearby-services' }, body: new URLSearchParams({ data: query }), signal: controller.signal });
        if (candidate.ok) { response = candidate; clearTimeout(timer); break; }
      } catch (_) {} finally { clearTimeout(timer); }
    }
    if (!response) throw new Error('Nessun nodo cartografico disponibile');
    const data = await response.json(), elements = data.elements || [];
    const items = categories.map(([label, matches]) => {
      const candidates = elements.filter(item => matches(item.tags || {})).map(item => {
        const itemLat = Number(item.lat ?? item.center?.lat), itemLng = Number(item.lon ?? item.center?.lon);
        return { item, km: distanceKm(lat, lng, itemLat, itemLng) };
      }).filter(value => Number.isFinite(value.km)).sort((a, b) => a.km - b.km);
      if (!candidates.length) return null;
      const nearest = candidates[0], metres = Math.max(10, Math.round(nearest.km * 1000 / 10) * 10), minutes = Math.max(1, Math.round(nearest.km / 4.8 * 60));
      return { label, name: nearest.item.tags?.name || label, metres, minutes };
    }).filter(Boolean);
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ items, source: 'OpenStreetMap' });
  } catch (error) {
    return res.status(502).json({ error: 'Dati nei dintorni temporaneamente non disponibili' });
  }
}
