export default async function handler(req, res) {
  const z = Number(req.query.z), x = Number(req.query.x), y = Number(req.query.y);
  if (![z, x, y].every(Number.isInteger) || z < 0 || z > 19 || x < 0 || y < 0) return res.status(400).send('Invalid tile');
  try {
    const response = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, { headers: { 'User-Agent': 'FUORISEDE/1.0 (student housing map)' } });
    if (!response.ok) return res.status(response.status).send('Tile unavailable');
    const body = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(body);
  } catch (error) { return res.status(502).send('Tile unavailable'); }
}
