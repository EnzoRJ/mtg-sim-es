// Vercel Serverless Function — proxy para búsqueda en Scryfall
// Ubicar en: /api/scryfall-search.js en tu proyecto de Vercel
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=300");

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "q required" });

  try {
    const r = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(q)}&order=name&unique=cards`,
      { headers: { "User-Agent": "CommanderES/1.0" } }
    );
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}