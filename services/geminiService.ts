
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT, SUGGESTION_PROMPT } from "../constants";

export const fetchRecipe = async (
  ingredient: string, 
  state: string, 
  servings: string, 
  language: string, 
  allergies: string,
  isAlternative: boolean = false,
  isDiet: boolean = false
): Promise<string> => {
  // Prefer Vite env in the browser, fall back to process.env for Node
  const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY as string) || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.8,
      },
    });

    return response.text || "No recipe found.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with the heritage engine.");
  }
};

export const fetchFamousSuggestion = async (ingredient: string): Promise<any> => {
  // Prefer Vite env in the browser, fall back to process.env for Node
  const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY as string) || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Find an iconic South Indian dish for: ${ingredient}`,
      config: {
        systemInstruction: SUGGESTION_PROMPT,
        responseMimeType: "application/json",
        // Adding responseSchema for better structured output and consistency
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dish: {
              type: Type.STRING,
              description: 'The name of the dish.'
            },
            state: {
              type: Type.STRING,
              description: 'The state of origin.'
            },
            place: {
              type: Type.STRING,
              description: 'Specific region or place.'
            },
            desc: {
              type: Type.STRING,
              description: 'Short description of the dish.'
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Search keywords.'
            }
          },
          required: ["dish", "state", "place", "desc", "keywords"],
          propertyOrdering: ["dish", "state", "place", "desc", "keywords"]
        }
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Discovery Error:", error);
    return null;
  }
};

export const generateRecipeImage = async (dishName: string): Promise<string | null> => {
  // Prefer Vite env in the browser, fall back to process.env for Node
  const apiKey = (import.meta.env?.VITE_GEMINI_API_KEY as string) || process.env.API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `High-quality, appetizing professional food photography of ${dishName}. Authentic South Indian plating on a banana leaf or clay plate. Warm, natural lighting.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // Iterate through candidates and parts to find the image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};
