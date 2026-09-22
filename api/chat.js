// Vercel Edge function.
// Forwards chat-completion requests to the shared dashboard proxy, which
// holds the real OpenRouter API key centrally. This app no longer holds a
// provider key itself (server-side or client-side).
//
// Required Vercel env vars:
//   DASHBOARD_PROXY_URL
//   DASHBOARD_PROXY_SECRET
//
// Note: the dashboard proxy always returns the provider's raw JSON response
// (not a stream), so any `stream: true` in the incoming payload is stripped
// before forwarding — the client-side service falls back to treating the
// full response as a single chunk.

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const proxyUrl = (process.env.DASHBOARD_PROXY_URL || "").trim();
  const proxySecret = (process.env.DASHBOARD_PROXY_SECRET || "").trim();

  if (!proxyUrl || !proxySecret) {
    return new Response(
      JSON.stringify({ error: "Server is missing DASHBOARD_PROXY_URL or DASHBOARD_PROXY_SECRET" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload;
  try {
    payload = JSON.parse(await req.text());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // The dashboard proxy returns a single JSON response, not an SSE stream.
  const { stream, ...rest } = payload || {};

  const upstream = await fetch(`${proxyUrl}/api/proxy/bunnys-kitchen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-proxy-secret": proxySecret,
    },
    body: JSON.stringify(rest),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
  });
}
