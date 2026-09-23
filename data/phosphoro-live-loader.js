const PHOSPHORO_FEED = 'https://roomanager.phosphoro.com/public/tmp/fuorisede.json';
const LOCAL_BLOCKS = [
  '/data/phosphoro-1.json','/data/phosphoro-2.json','/data/phosphoro-3.json',
  '/data/phosphoro-4.json','/data/phosphoro-5.json','/data/phosphoro-6.json'
];

async function json(url) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
  return r.json();
}

function arrayFromFeed(raw) {
  if (Array.isArray(raw)) return raw;
  for (const key of ['items','listings','annunci','data']) if (Array.isArray(raw?.[key])) return raw[key];
  return [];
}

function normalizeFeedItem(x) {
  // The live feed may already expose FUORISEDE-shaped records. Keep them as-is.
  if (x?.publication && (x.externalId != null || x.id != null)) return x;
  return null;
}

async function livePhosphoro() {
  const raw = await json(PHOSPHORO_FEED);
  const items = arrayFromFeed(raw).map(normalizeFeedItem).filter(Boolean);
  if (!items.length) throw new Error('Phosphoro feed returned no usable listings');
  return items;
}

async function localPhosphoro() {
  const blocks = await Promise.all(LOCAL_BLOCKS.map(json));
  return blocks.flat();
}

function dedupe(items) {
  const out = new Map();
  for (const x of items) {
    const key = x.publication?.source === 'Phosphoro'
      ? 'phosphoro:' + String(x.externalId ?? x.id)
      : 'local:' + String(x.id);
    out.set(key, x);
  }
  return [...out.values()];
}

export async function loadFerraraListings() {
  const base = await json('/data/listings-operativa-v3.json');
  let phosphoro;
  try {
    phosphoro = await livePhosphoro();
    console.info('Phosphoro live feed loaded', phosphoro.length);
  } catch (error) {
    console.warn('Phosphoro live feed unavailable; using last verified snapshot', error);
    phosphoro = await localPhosphoro();
  }
  return dedupe([...base, ...phosphoro]).filter(x => x.city === 'Ferrara');
}
