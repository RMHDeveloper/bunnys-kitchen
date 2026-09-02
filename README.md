<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/17pgfeqpEF7cU2zS03Wa-GAYVMK75Drk5

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `VITE_OPENROUTER_API_KEY` to your
   [OpenRouter API key](https://openrouter.ai/settings/keys) (free tier works).
3. Run the app:
   `npm run dev`

## Deploy (Vercel)

Add `VITE_OPENROUTER_API_KEY` under Project → Settings → Environment Variables,
then redeploy. Note: this is a frontend-only app, so the key ships in the browser
bundle — fine for a demo, but proxy the API through a backend for production.
