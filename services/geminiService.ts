
import { SYSTEM_PROMPT, SUGGESTION_PROMPT } from "../constants";

// OpenRouter (OpenAI-compatible) API.
// `openrouter/free` auto-routes each request to an available free model that
// supports the required features (text + image input, structured output, etc.).
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

const getApiKey = (): string => {
  const key = import.meta.env?.VITE_OPENROUTER_API_KEY as string | undefined;
  if (!key) {
    throw new Error("Missing VITE_OPENROUTER_API_KEY. Add it to your .env file.");
  }
  return key;
};

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const chat = async (
  messages: ChatMessage[],
  options: { temperature?: number; json?: boolean } = {}
): Promise<string> => {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      // Optional attribution headers used by OpenRouter for rankings.
      "HTTP-Referer":
        typeof window !== "undefined"
          ? window.location.origin
          : "https://bunnys-kitchen.vercel.app",
      "X-Title": "Bunny's Kitchen",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.8,
      ...(options.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("OpenRouter API Error:", res.status, detail);
    throw new Error("Failed to communicate with the heritage engine.");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
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
  isDiet: boolean = false
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
    { temperature: 0.8 }
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
