/* FUORISEDE universal Immobiliare.it sandbox proxy.
 * Credentials stay in Vercel environment variables and are never exposed client-side.
 */

const API_BASE = process.env.IMMOBILIARE_API_BASE || 'https://api.immobiliare.it';

function pick(obj, paths, fallback = null) {
  for (const path of paths) {
    const value = path.split('.').reduce((acc, key) => acc == null ? undefined : acc[key], obj);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function number(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalize(raw) {
  const price = number(pick(raw, ['price.value','price','contract.price']));
  const expenses = number(pick(raw, ['expenses.value','expenses','condominiumExpenses']));
  const address = pick(raw, ['location.address','address','properties.location.address'], 'Milano');
  const id = pick(raw, ['id','realEstate.id','properties.id']);
  const description = pick(raw, ['description','properties.description'], '');
  const sourceUrl = pick(raw, ['url','properties.url'], id ? `https://www.immobiliare.it/annunci/${id}/` : null);
  const photosRaw = pick(raw, ['photos','images','properties.photos'], []);
  const photos = Array.isArray(photosRaw) ? photosRaw.map(p => typeof p === 'string' ? p : pick(p, ['url','src','large'], null)).filter(Boolean).slice(0, 6) : [];
  return {
    id,
    externalId: pick(raw, ['externalId','properties.externalId']),
    title: pick(raw, ['title','properties.title'], `Alloggio · ${address}`),
    city: 'Milano', address,
    lat: number(pick(raw, ['location.latitude','latitude','lat','properties.location.latitude'])),
    lng: number(pick(raw, ['location.longitude','longitude','lng','properties.location.longitude'])),
    locationStatus: 'approximate_area',
    price, expenses,
    realMonthlyCost: price == null ? null : price + (expenses || 0),
    realMonthlyCostStatus: expenses == null ? 'minimum_known' : 'complete',
    photos,
    features: pick(raw, ['features','properties.features'], []),
    details: {
      utilities: expenses == null ? 'Da verificare nell’annuncio originale' : 'Spese indicate nell’annuncio originale',
      contract: 'Da verificare nell’annuncio originale', deposit: 'Da verificare',
      bathroom: String(pick(raw, ['bathrooms','properties.bathrooms'], 'Da verificare')),
      floor: String(pick(raw, ['floor','properties.floor'], 'Da verificare')),
      description
    },
    availability: { availableFrom: null, availableLabel: 'Da verificare', status: 'to_reconfirm', confirmedAt: null },
    publication: { status: 'sandbox', authorized: true, source: 'Immobiliare.it Sandbox', sourceType: 'portal', sourceUrl },
    validation: { priceDeclared: price != null, expensesDeclared: expenses != null, contractDeclared: false, utilitiesDeclared: false, listingConfirmedAt: null },
    candidates: 0
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = process.env.IMMOBILIARE_API_TOKEN;
  if (!token) return res.status(500).json({ error: 'IMMOBILIARE_API_TOKEN non configurato' });
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const endpoint = process.env.IMMOBILIARE_SEARCH_PATH || '/search';
  const url = new URL(endpoint, API_BASE);
  url.searchParams.set('city', req.query.city || 'Milano');
  url.searchParams.set('limit', String(limit));
  const upstream = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
  if (!upstream.ok) return res.status(upstream.status).json({ error: 'Immobiliare upstream error', status: upstream.status });
  const payload = await upstream.json();
  const rows = pick(payload, ['items','results','data.items','data.results'], []);
  const items = Array.isArray(rows) ? rows.map(normalize) : [];
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ items, total: number(pick(payload, ['total','count','data.total'], items.length)) ?? items.length, environment: 'sandbox' });
}
