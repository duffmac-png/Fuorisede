const API_BASE = process.env.IMMOBILIARE_API_BASE || 'https://sandbox-comparables.realitycs.it';
let cachedToken = null, tokenExpiresAt = 0;

function env(...names) { for (const name of names) if (process.env[name]) return process.env[name]; return ''; }
function number(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }
function imageUrls(value, found = new Set()) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value) && /(?:image|img|photo|\.jpe?g|\.webp|\.png)/i.test(value)) found.add(value);
  else if (Array.isArray(value)) value.forEach(item => imageUrls(item, found));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => imageUrls(item, found));
  return [...found];
}

async function accessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;
  const username = env('IMMOBILIARE_USERNAME', 'USERNAME');
  const password = env('IMMOBILIARE_PASSWORD', 'PASSWORD');
  const clientId = env('IMMOBILIARE_CLIENT_ID', 'CLIENT_ID');
  const clientSecret = env('IMMOBILIARE_CLIENT_SECRET', 'CLIENT_SECRET');
  if (!username || !password || !clientId || !clientSecret) throw Object.assign(new Error('Credenziali Sandbox non configurate nel progetto corrente'), { status: 500 });
  const response = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'password', username, password })
  });
  if (!response.ok) throw Object.assign(new Error('Autenticazione Sandbox rifiutata'), { status: response.status });
  const payload = await response.json();
  cachedToken = payload.access_token;
  tokenExpiresAt = Date.now() + Math.max(60, Number(payload.expires_in) || 14399) * 1000;
  return cachedToken;
}

function availabilityFromText(text) {
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (/disponibil[ei]\s+(?:da\s+)?subito|liber[oa]\s+(?:da\s+)?subito/i.test(clean)) return { availableFrom: new Date().toISOString().slice(0, 10), availableLabel: 'Disponibile subito', status: 'declared' };
  const months = { gennaio:1, febbraio:2, marzo:3, aprile:4, maggio:5, giugno:6, luglio:7, agosto:8, settembre:9, ottobre:10, novembre:11, dicembre:12 };
  const match = clean.toLowerCase().match(/(?:disponibil[ei]|liber[oa]|dal|da)\D{0,28}(?:(\d{1,2})\s+)?(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)(?:\s+(\d{4}))?/i);
  if (!match) return { availableFrom: null, availableLabel: 'Da verificare', status: 'to_reconfirm' };
  const day = Number(match[1] || 1), month = months[match[2]], year = Number(match[3] || new Date().getFullYear());
  return { availableFrom: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, availableLabel: `Dal ${day}/${month}/${year}`, status: 'declared' };
}

function expensesFromText(text) {
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
  const patterns = [
    /spese\s+(?:condominiali|accessorie|mensili)[^\d€]{0,45}(?:€\s*)?(\d{1,4}(?:[.,]\d{1,2})?)/i,
    /(?:€\s*)?(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:€|euro)?\s*(?:\/\s*mese|mensili)[^.!?]{0,35}(?:di\s+)?spese/i,
    /condominio[^\d€]{0,45}(?:€\s*)?(\d{1,4}(?:[.,]\d{1,2})?)/i
  ];
  for (const pattern of patterns) {
    const match = clean.match(pattern), value = match ? number(match[1].replace('.', '').replace(',', '.')) : null;
    if (value != null && value >= 0 && value <= 2000) return value;
  }
  if (/nessuna\s+spesa\s+condominiale|spese\s+condominiali\s+(?:pari\s+a\s+)?zero/i.test(clean)) return 0;
  return null;
}

function structuredExpenses(value, path = '') {
  if (!value || typeof value !== 'object') return null;
  for (const [key, child] of Object.entries(value)) {
    const current = `${path}.${key}`.toLowerCase();
    if (/(annual|year|annuali|annuo)/i.test(current)) continue;
    if (/(expense|expenses|condom|spese|monthlycost|additionalcost)/i.test(key) && (typeof child === 'number' || typeof child === 'string')) {
      const parsed = number(String(child).replace(/[^\d.,-]/g, '').replace('.', '').replace(',', '.'));
      if (parsed != null && parsed >= 0 && parsed <= 2000) return parsed;
    }
    const nested = structuredExpenses(child, current);
    if (nested != null) return nested;
  }
  return null;
}

function contractFromText(text) {
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const rules = [
    [/contratto[^.!?]{0,45}(?:transitorio|temporaneo)/i, 'Contratto transitorio'],
    [/(?:contratto[^.!?]{0,45})?(?:4\s*\+\s*4|quattro\s*\+\s*quattro)/i, 'Contratto 4+4'],
    [/contratto[^.!?]{0,45}(?:3\s*\+\s*2|tre\s*\+\s*due|canone concordato)/i, 'Contratto a canone concordato'],
    [/contratto[^.!?]{0,55}(?:studenti|universitari)/i, 'Contratto per studenti'],
    [/contratto[^.!?]{0,45}(?:libero|ordinario)/i, 'Contratto libero']
  ];
  return rules.find(([pattern]) => pattern.test(clean))?.[1] || null;
}

function depositFromText(text) {
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const months = clean.match(/(?:deposito|cauzione|caparra)[^.!?]{0,45}(\d)\s*mensilit/i);
  if (months) return `${months[1]} mensilità`;
  const amount = clean.match(/(?:deposito|cauzione|caparra)[^\d€]{0,45}(?:€\s*)?(\d{2,5}(?:[.,]\d{1,2})?)/i);
  return amount ? `€ ${amount[1]}` : null;
}

function utilitiesFromText(text, expenses) {
  const clean = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const included = [], excluded = [];
  for (const [pattern, label] of [[/riscaldamento/i,'riscaldamento'],[/acqua/i,'acqua'],[/luce|energia elettrica/i,'luce'],[/gas/i,'gas'],[/internet|wi.?fi/i,'internet']]) {
    if (new RegExp(`${pattern.source}[^.!?]{0,35}(?:inclus[oaie]|compres[oaie])|(?:inclus[oaie]|compres[oaie])[^.!?]{0,35}${pattern.source}`,'i').test(clean)) included.push(label);
    if (new RegExp(`${pattern.source}[^.!?]{0,35}(?:esclus[oaie]|a parte|non inclus[oaie])|(?:esclus[oaie]|a parte|non inclus[oaie])[^.!?]{0,35}${pattern.source}`,'i').test(clean)) excluded.push(label);
  }
  const parts=[];
  if (expenses != null) parts.push(`Spese dichiarate: € ${expenses} / mese`);
  if (included.length) parts.push(`incluse: ${included.join(', ')}`);
  if (excluded.length) parts.push(`escluse: ${excluded.join(', ')}`);
  return { text: parts.join('; ') || null, declared: parts.length > 0 };
}

function normalize(raw) {
  const price = number(raw?.value?.askingPrice ?? raw?.askingPrice);
  const originalText = raw?.features?.description || '';
  const expenses = structuredExpenses(raw) ?? expensesFromText(originalText);
  const contract = contractFromText(originalText);
  const deposit = depositFromText(originalText);
  const utilities = utilitiesFromText(originalText, expenses);
  const address = [raw?.location?.address, raw?.location?.streetNumber].filter(Boolean).join(' ') || 'Milano';
  const preferredCovers = { '131921834': 'https://images.realitycs.it/img/131921834/1992631586' };
  const listingNumber = String(raw?.listingUrl || '').match(/annunci\/(\d+)/)?.[1] || String(raw?.listingID || raw?.uuid || '');
  const cover = preferredCovers[listingNumber] || raw?.attachments?.coverImage;
  const photos = [...new Set([cover, ...imageUrls(raw?.attachments)].filter(Boolean))];
  const facility = Array.isArray(raw?.features?.facilityList) ? raw.features.facilityList : [];
  const features = [raw?.propertyType, raw?.features?.maintenanceStatus, raw?.features?.elevator ? 'Ascensore' : null, ...facility].filter(Boolean).slice(0, 8);
  return {
    id: raw?.listingID || raw?.uuid, externalId: raw?.uuid,
    title: raw?.extra?.title || `${raw?.propertyType || 'Alloggio'} · ${address}`,
    accommodationType: 'home', city: 'Milano', address,
    lat: number(raw?.location?.latitude), lng: number(raw?.location?.longitude), locationStatus: 'approximate_area',
    price, expenses, realMonthlyCost: price == null ? null : price + (expenses || 0), realMonthlyCostStatus: price == null ? 'unknown' : expenses == null ? 'minimum_known' : 'complete',
    photos, features,
    details: {
      utilities: utilities.text || 'Spese e utenze non quantificate nel testo dell’annuncio',
      contract: contract || 'Tipologia di contratto non indicata nel testo dell’annuncio', deposit: deposit || 'Deposito non indicato nel testo dell’annuncio',
      bathroom: raw?.features?.numberOfBathrooms == null ? 'Da verificare' : String(raw.features.numberOfBathrooms),
      floor: raw?.features?.unitFloor == null ? 'Da verificare' : String(raw.features.unitFloor),
      description: `${raw?.propertyType || 'Alloggio'} in ${raw?.location?.marketZone || 'Milano'}${raw?.grossSquareFootage ? ` · ${raw.grossSquareFootage} m²` : ''}. Per descrizione completa e contatti consulta l’annuncio originale.`
    },
    availability: availabilityFromText(originalText),
    publication: { status: 'sandbox', authorized: true, source: 'Immobiliare.it', sourceType: 'portal', sourceUrl: listingNumber ? `https://www.immobiliare.it/annunci/${listingNumber}/` : null },
    validation: { priceDeclared: price != null, expensesDeclared: expenses != null, contractDeclared: contract != null, utilitiesDeclared: utilities.declared, listingConfirmedAt: raw?.lastUpdateDate || null }, candidates: 0
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const token = await accessToken();
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const response = await fetch(`${API_BASE}/comparables/fullSearchByAttribute`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ Filters: { contractTypeID: 2, categoryTypeID: 1, municipalityID: '15146', pubblicationStatusID: [1, 2] }, Pagination: { page: 1, limit }, Sorting: { by: 'date', direction: 'desc' } })
    });
    if (!response.ok) throw Object.assign(new Error('Ricerca Sandbox rifiutata'), { status: response.status });
    const payload = await response.json(), rows = Array.isArray(payload?.items) ? payload.items : [];
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ items: rows.map(normalize), total: number(payload?._metadata?.total_count) ?? rows.length, environment: 'sandbox' });
  } catch (error) { return res.status(error.status || 500).json({ error: error.message || 'Errore Sandbox' }); }
}
