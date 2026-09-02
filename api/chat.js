// Vercel Edge function.
// Streams chat-completion requests to OpenRouter so the API key stays on the
// server (a Vercel env var) and tokens reach the browser as they are generated.
//
// Required Vercel env var (either name works):
//   OPENROUTER_API_KEY   ...or...   VITE_OPENROUTER_API_KEY

export const config = { runtime: "edge" };

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const key =
    process.env.OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY ||
    "";

  if (!key) {
    return new Response(
      JSON.stringify({ error: "Server is missing OPENROUTER_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await req.text();

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://bunny-kitchen.thermh.in",
      "X-Title": "Bunny's Kitchen",
    },
    body,
  });

  // Pass the upstream body straight through (SSE stream or plain JSON).
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") || "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
