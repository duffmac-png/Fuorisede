// FUORISEDE · sincronizzazione giornaliera annunci Phosphoro (Ferrara).
// Uso: node scripts/sync-phosphoro.mjs <cartella-sito> [file-feed-locale]
// Scarica il feed Phosphoro, lo valida e riscrive <sito>/data/phosphoro-ferrara.json.
// Se il feed non risponde o non supera i controlli, esce con errore e NON tocca i dati.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const FEED = process.env.PHOSPHORO_FEED || 'https://roomanager.phosphoro.com/public/tmp/fuorisede.json';
const MIN_ITEMS = 5;          // sotto questa soglia il feed è considerato anomalo
const MAX_DROP = 0.5;         // blocca se sparisce più del 50% degli annunci in un colpo solo
const siteDir = process.argv[2] || '.';
const localFeed = process.argv[3];
const OUT = path.join(siteDir, 'data/phosphoro-ferrara.json');
const OLD_BLOCKS = [1, 2, 3, 4, 5, 6].map(i => path.join(siteDir, `data/phosphoro-${i}.json`));

const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
const arr = raw => { if (Array.isArray(raw)) return raw; for (const k of ['items', 'listings', 'annunci', 'data']) if (Array.isArray(raw?.[k])) return raw[k]; return []; };
const it = v => v == null ? null : typeof v === 'string' ? v : (v.it || v.en || null);
const n = v => { if (v === null || v === undefined || v === '') return null; const x = Number(v); return Number.isFinite(x) ? x : null; };

const CONTRACTS = { '3+2': 'Canone concordato 3+2', '4+4': 'Canone libero 4+4', transitorio: 'Transitorio', transitorio_studenti: 'Transitorio per studenti', turistico: 'Turistico' };
const TYPES = { stanza_singola: 'Stanza singola', stanza_doppia: 'Stanza doppia', doppia_uso_singola: 'Doppia uso singola', appartamento: 'Appartamento intero' };

function features(x, p, room) {
  const out = [];
  if (TYPES[x.type] && x.type !== 'stanza_singola') out.push(TYPES[x.type]);
  if (p.wifi) out.push('Wi-Fi'); if (p.washingMachine) out.push('Lavatrice'); if (p.dishwasher) out.push('Lavastoviglie');
  if (p.dryer) out.push('Asciugatrice'); if (p.elevator) out.push('Ascensore'); if (room?.balcony || p.balcony) out.push('Balcone');
  if (room?.airConditioning) out.push('Aria condizionata'); if (room?.privateBathroom) out.push('Bagno privato');
  if (p.furnished) out.push('Arredato');
  if (p.carParking) out.push('Posto auto'); if (p.bikeParking) out.push('Posto bici');
  const mq = n(room?.squareMetres); if (mq > 0 && x.type !== 'appartamento') out.push(`Stanza ${String(mq).replace('.', ',')} m²`);
  return out;
}
function campus(p) {
  const z = Array.isArray(p.nearbyZones) ? p.nearbyZones[0] : null;
  return z
    ? { campusId: 'centro', campusName: it(z.title) || 'Polo universitario', distanceKm: null, minutesBike: n(z.bikeMinutes) || null, travelEstimate: false }
    : { campusId: 'centro', campusName: 'Polo universitario', distanceKm: null, minutesBike: null, travelEstimate: true };
}
function contract(x) {
  const kind = CONTRACTS[x.contractType] || (x.contractType ? String(x.contractType).replaceAll('_', ' ') : null);
  const min = n(x.minimumStay);
  const parts = [kind, min ? 'permanenza minima ' + min + (min === 1 ? ' mese' : ' mesi') : null].filter(Boolean);
  return parts.length ? parts.join(' · ').replace(/^./, c => c.toUpperCase()) : 'Da verificare nell’annuncio Phosphoro';
}
function bathroom(p, room) {
  if (room.privateBathroom) return 'Privato';
  const b = n(p.bathroomsNumber);
  return b > 0 ? `Condiviso · ${b} ${b === 1 ? 'bagno' : 'bagni'} nell'appartamento` : 'Condiviso';
}
function floor(p) {
  if (p.floor == null || p.floor === '') return 'Da verificare';
  const f = n(p.floor), lift = p.elevator ? ' con ascensore' : ' senza ascensore';
  return (f === 0 ? 'Piano terra' : f != null ? f + '° piano' : String(p.floor)) + lift;
}
function normalize(x) {
  const p = x.property || {}, room = x.room || {};
  const rawPrice = n(x.monthlyPrice), price = rawPrice > 0 ? rawPrice : null, dep = n(x.depositPrice), min = n(x.minimumStay);
  const date = String(x.availableFrom || '').trim().slice(0, 10);
  const future = date && date > today;
  return {
    id: 10000 + n(x.id), externalId: String(x.id), title: (it(x.title) || x.code || 'Alloggio Phosphoro').trim(), city: p.city || 'Ferrara',
    address: [p.address, p.houseNumber].filter(Boolean).join(' ') + ', ' + (p.city || 'Ferrara'),
    lat: n(p.latitude), lng: n(p.longitude), locationStatus: 'verified_street',
    price, expenses: null, realMonthlyCost: price, realMonthlyCostStatus: price != null ? 'minimum_known' : 'unknown',
    photos: [...new Set([...(room.photos || []), ...(p.photos || [])])].slice(0, 4), features: features(x, p, room),
    details: {
      utilities: 'Da verificare nell’annuncio Phosphoro',
      contract: contract(x),
      deposit: dep != null ? '€ ' + dep : 'Da verificare',
      bathroom: bathroom(p, room),
      floor: floor(p)
    },
    availability: {
      availableFrom: future ? date : null,
      availableLabel: future ? 'Disponibile dal ' + date.split('-').reverse().join('/') : 'Disponibile ora',
      status: 'confirmed', confirmedAt: today
    },
    publication: { status: 'authorized', authorized: true, source: 'Phosphoro', sourceUrl: x.url, sourceType: 'portal' },
    validation: { priceDeclared: price != null, expensesDeclared: false, contractDeclared: min != null, utilitiesDeclared: false, listingConfirmedAt: today },
    campusReference: campus(p), candidates: 0,
    accommodationType: x.type === 'appartamento' ? 'apartment' : 'room'
  };
}

async function loadFeed() {
  if (localFeed) return JSON.parse(await readFile(localFeed, 'utf8'));
  let last;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(FEED, { headers: { accept: 'application/json', 'user-agent': 'FUORISEDE/1.0 (+https://www.fuori-sede.it)' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) { last = e; await new Promise(res => setTimeout(res, 5000 * (i + 1))); }
  }
  throw new Error('Feed Phosphoro non raggiungibile: ' + last);
}

async function previous() {
  if (existsSync(OUT)) return JSON.parse(await readFile(OUT, 'utf8'));
  const blocks = [];
  for (const f of OLD_BLOCKS) if (existsSync(f)) blocks.push(...JSON.parse(await readFile(f, 'utf8')));
  return blocks;
}

const raw = arr(await loadFeed());
const ferrara = raw.filter(x => (x.property?.city || '') === 'Ferrara');
const problems = [];
if (ferrara.length < MIN_ITEMS) problems.push(`solo ${ferrara.length} annunci Ferrara nel feed (minimo ${MIN_ITEMS})`);
const ids = ferrara.map(x => String(x.id));
if (new Set(ids).size !== ids.length) problems.push('id duplicati nel feed');
const bad = ferrara.filter(x => !x.id || !x.url || !(x.room?.photos?.length || x.property?.photos?.length));
if (bad.length) problems.push(`${bad.length} annunci senza id, link o foto: ${bad.map(x => x.id).join(', ')}`);

const before = await previous();
if (before.length && ferrara.length < before.length * (1 - MAX_DROP))
  problems.push(`il feed ha ${ferrara.length} annunci contro ${before.length} di ieri: calo sospetto, aggiornamento bloccato`);

if (problems.length) {
  console.error('SINCRONIZZAZIONE BLOCCATA — dati del sito lasciati invariati:\n - ' + problems.join('\n - '));
  process.exit(1);
}

const items = ferrara.map(normalize).sort((a, b) => a.id - b.id);
await writeFile(OUT, JSON.stringify(items, null, 1) + '\n');

const oldIds = new Set(before.map(x => String(x.externalId)));
const newIds = new Set(items.map(x => x.externalId));
const added = [...newIds].filter(i => !oldIds.has(i));
const removed = [...oldIds].filter(i => !newIds.has(i));
const summary = `Phosphoro ${today}: ${items.length} annunci Ferrara · nuovi ${added.length}${added.length ? ' (' + added.join(', ') + ')' : ''} · rimossi ${removed.length}${removed.length ? ' (' + removed.join(', ') + ')' : ''}`;
console.log(summary);
if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `summary=${summary}\n`, { flag: 'a' });
