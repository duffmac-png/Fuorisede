const AIRTABLE_API = 'https://api.airtable.com/v0';

const ALLOWED_EVENTS = new Set([
  'qualified_visit',
  'listing_open',
  'compare_start',
  'favorite_add',
  'listing_contact',
  'partner_outbound'
]);

function clean(value, max) {
  if (value == null) return '';
  return String(value).slice(0, max || 200);
}

export default async function handler(req, res) {
  // Controllo rapido: aprire /api/pilot-event nel browser dice se Vercel ha le chiavi di Airtable.
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      ok: true,
      airtableToken: Boolean(process.env.AIRTABLE_TOKEN),
      airtableBase: Boolean(process.env.AIRTABLE_BASE_ID),
      table: process.env.AIRTABLE_TABLE_ID || 'Eventi Funnel'
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.AIRTABLE_TABLE_ID || 'Eventi Funnel';

  if (!token || !baseId) {
    console.error('Airtable analytics configuration missing');
    return res.status(503).json({ ok: false });
  }

  const body = req.body || {};
  const event = clean(body.event, 60);
  if (!ALLOWED_EVENTS.has(event)) return res.status(400).json({ ok: false });

  const visitorId = clean(body.visitorId, 100);
  const sessionId = clean(body.session, 100);
  const listingId = clean(body.listingId, 100);
  const source = clean(body.source || body.campaign, 150);
  const device = clean(body.device, 50);
  const eventTime = body.ts && !Number.isNaN(Date.parse(body.ts))
    ? new Date(body.ts).toISOString()
    : new Date().toISOString();

  const fields = {
    'Event Type': event,
    'Visitor ID': visitorId,
    'Session ID': sessionId,
    'Listing ID': listingId,
    'Event Date/Time': eventTime,
    'Traffic Source/Campaign': source,
    'Device Type': device
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key] === '') delete fields[key];
  });

  try {
    const response = await fetch(
      AIRTABLE_API + '/' + encodeURIComponent(baseId) + '/' + encodeURIComponent(tableId),
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: [{ fields }], typecast: true })
      }
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error('Airtable analytics write failed', response.status, detail.slice(0, 500));
      return res.status(502).json({ ok: false });
    }

    return res.status(204).end();
  } catch (error) {
    console.error('Airtable analytics error', error);
    return res.status(502).json({ ok: false });
  }
}
