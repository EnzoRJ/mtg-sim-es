// Vercel Serverless Function — proxy para Scryfall
// Ubicar en: /api/scryfall.js en proyecto de Vercel
export default async function handler(req, res) {
  // CORS headers para permitir tu frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=3600"); // cache 1 hora

  const { name, lang } = req.query;
  if (!name) return res.status(400).json({ error: "name required" });

  const targetLang = lang || "es";
  
  try {
    // Primero intentar en español
    if (targetLang !== "en") {
      const esRes = await fetch(
        `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&lang=${targetLang}`,
        { headers: { "User-Agent": "CommanderES/1.0" } }
      );
      const esData = await esRes.json();
      if (esData.object !== "error") {
        return res.status(200).json({
          found: true,
          lang: esData.lang,
          image_url: esData.image_uris?.normal || esData.card_faces?.[0]?.image_uris?.normal || null,
          printed_name: esData.printed_name || esData.name,
          printed_text: esData.printed_text || esData.oracle_text,
          type_line: esData.printed_type_line || esData.type_line,
          // Pass through full card data too
          ...esData,
          image_url: esData.image_uris?.normal || esData.card_faces?.[0]?.image_uris?.normal || null,
        });
      }
    }

    // Fallback: inglés
    const enRes = await fetch(
      `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
      { headers: { "User-Agent": "CommanderES/1.0" } }
    );
    const enData = await enRes.json();
    if (enData.object === "error") {
      // Fuzzy search
      const fuzzRes = await fetch(
        `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`,
        { headers: { "User-Agent": "CommanderES/1.0" } }
      );
      const fuzzData = await fuzzRes.json();
      if (fuzzData.object === "error") return res.status(404).json({ error: "Card not found" });
      return res.status(200).json({
        ...fuzzData,
        image_url: fuzzData.image_uris?.normal || fuzzData.card_faces?.[0]?.image_uris?.normal || null,
      });
    }

    return res.status(200).json({
      ...enData,
      image_url: enData.image_uris?.normal || enData.card_faces?.[0]?.image_uris?.normal || null,
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}