
import { SYSTEM_PROMPT, SUGGESTION_PROMPT } from "../constants";

// OpenRouter (OpenAI-compatible) API, called through this app's own
// server-side proxy (api/chat.js), which forwards to the shared dashboard
// proxy. No provider key ever lives in this app, server-side or client-side.
// We pin known-good free models rather than the `openrouter/free` auto-router,
// which frequently picks weak models that loop on Indic-language output or
// route to moderation-only models. OpenRouter tries each id in order and falls
// through to the next on rate-limit / error.
const PROXY_URL = "/api/chat";
// OpenRouter allows at most 3 ids here; it tries them in order.
const MODELS = [
  "minimax/minimax-m3:free",
  "z-ai/glm-5.2:free",
  "google/gemma-4-31b-it:free",
];

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Detects the degenerate "same token over and over" loop that weak free models
// fall into on long non-English generations.
const isDegenerate = (text: string): boolean => {
  const tokens = text.trim().split(/\s+/);
  if (tokens.length < 20) return false;
  let run = 1;
  for (let i = 1; i < tokens.length; i++) {
    run = tokens[i] === tokens[i - 1] ? run + 1 : 1;
    if (run >= 6) return true;
  }
  const unique = new Set(tokens).size;
  return unique / tokens.length < 0.15;
};

type ChatOptions = {
  temperature?: number;
  json?: boolean;
  stream?: boolean;
  onProgress?: (partial: string) => void;
};

const buildPayload = (messages: ChatMessage[], options: ChatOptions) => ({
  models: MODELS,
  messages,
  temperature: options.temperature ?? 0.7,
  max_tokens: 1100,
  frequency_penalty: 0.5,
  presence_penalty: 0.3,
  reasoning: { exclude: true }, // don't leak chain-of-thought into content
  ...(options.json ? { response_format: { type: "json_object" } } : {}),
});

const callOnce = async (
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> => {
  const payload = buildPayload(messages, options);

  const res: Response | null = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!res || !res.ok) {
    const detail = res ? await res.text().catch(() => "") : "";
    console.error("OpenRouter API Error:", res?.status, detail);
    throw new Error("Failed to communicate with the heritage engine.");
  }

  const data = await res.json();
  const content = (data.choices?.[0]?.message?.content ?? "").trim();
  // The dashboard proxy always returns a single JSON response (no SSE), so
  // report the full text as one progress update to keep the streaming UI path
  // working, just without incremental token-by-token updates.
  if (options.stream) options.onProgress?.(content);
  return content;
};

const chat = async (
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> => {
  let text = await callOnce(messages, options);
  // One retry if the model got stuck in a repetition loop.
  if (isDegenerate(text)) {
    console.warn("Detected degenerate output, retrying once.");
    text = await callOnce(messages, options);
    if (isDegenerate(text)) {
      throw new Error("The heritage engine stumbled. Please try again.");
    }
  }
  return text;
};

// Strips ```json ... ``` fences some models wrap JSON in.
const parseJson = (raw: string): any => {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned);
};

export const fetchRecipe = async (
  ingredient: string,
  state: string,
  servings: string,
  language: string,
  allergies: string,
  isAlternative: boolean = false,
  isDiet: boolean = false,
  onProgress?: (partial: string) => void
): Promise<string> => {
  const userPrompt = `
Language to use for the response: ${language}
Dish/Ingredient requested: ${ingredient}
Dietary Restrictions (Allergies): ${allergies || 'None'}
Portion Size: ${servings} people
Tradition: ${state}
${isAlternative ? "IMPORTANT: The user wants a DIFFERENT RELATED dish. For example, if they saw Dindigul Biryani, show Ambur Biryani or Thalassery Biryani. If they saw a specific Sambar, show a different regional variation. It must use a similar theme but be a distinct traditional recipe from the South." : ""}
${isDiet ? "IMPORTANT: Provide a HEALTHY/DIET-FRIENDLY version of this traditional dish. Focus on minimal oil, low glycemic index ingredients, and nutrient-dense substitutions (like millets instead of white rice if applicable) while keeping the South Indian soul intact." : ""}

REQUIREMENTS:
1. Provide the recipe in ${language}.
2. Ensure no ${allergies || 'prohibited'} ingredients are used.
3. Quantities must serve ${servings}.
`;

  const text = await chat(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    { temperature: 0.8, stream: true, onProgress }
  );
  return text || "No recipe found.";
};

export const fetchFamousSuggestion = async (ingredient: string): Promise<any> => {
  try {
    const schemaHint = `
Return ONLY a JSON object with exactly these keys:
{
  "dish": "The name of the dish.",
  "state": "The state of origin.",
  "place": "Specific region or place.",
  "desc": "Short description of the dish.",
  "keywords": ["search", "keywords"]
}`;
    const text = await chat(
      [
        { role: "system", content: `${SUGGESTION_PROMPT}\n${schemaHint}` },
        { role: "user", content: `Find an iconic South Indian dish for: ${ingredient}` },
      ],
      { temperature: 0.7, json: true }
    );
    return parseJson(text || "{}");
  } catch (error) {
    console.error("Discovery Error:", error);
    return null;
  }
};

export const generateRecipeImage = async (_dishName: string): Promise<string | null> => {
  // OpenRouter's free tier has no image-generation models, so we skip this.
  // The UI already renders the recipe gracefully without a photo.
  return null;
};
