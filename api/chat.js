// Vercel serverless function.
// Proxies chat-completion requests to OpenRouter so the API key stays on the
// server (a Vercel env var) and never ships in the browser bundle.
//
// Required Vercel env var (either name works):
//   OPENROUTER_API_KEY   ...or...   VITE_OPENROUTER_API_KEY

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const key =
    process.env.OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY ||
    "";

  if (!key) {
    res.status(500).json({ error: "Server is missing OPENROUTER_API_KEY" });
    return;
  }

  // Vercel parses JSON bodies automatically; guard for string just in case.
  let payload = req.body;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = {};
    }
  }

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://bunny-kitchen.thermh.in",
        "X-Title": "Bunny's Kitchen",
      },
      body: JSON.stringify(payload || {}),
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).json({ error: "Upstream request failed" });
  }
}
