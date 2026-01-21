import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

/**
 * Generates a recipe from an image by calling the Gemini API directly.
 * @param {string} imageData - The base64 encoded data URL of the image.
 * @param {string} language - The language for the recipe to be generated in.
 * @returns {Promise<Recipe>} A promise that resolves to the generated recipe.
 */
export interface GeneratedRecipeResult {
  recipe: Recipe;
  remaining?: number;
  limit?: number;
}

export const generateRecipeFromImage = async (
  imageData: string,
  language: string = 'English',
  dietaryContext?: string,
  accessToken?: string
): Promise<GeneratedRecipeResult> => {
  try {
    // Prefer server-side generation with quota enforcement when Supabase auth is available
    if (supabaseUrl && accessToken) {
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-recipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ imageData, language, dietaryContext }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const message = payload?.error || 'Failed to generate recipe.';
        throw new Error(message);
      }

      if (!payload?.recipe) {
        throw new Error('Unexpected response from recipe generator.');
      }

      return { recipe: payload.recipe as Recipe, remaining: payload.remaining, limit: payload.limit };
    }

    // Fallback: direct Gemini call (no quota enforcement)
    // This is used if Supabase is not configured or user is not logged in (depending on logic)
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please add it to your .env.local file.");
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Extract mime type and base64 data from the data URL
    const imageParts = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!imageParts || imageParts.length !== 3) {
      throw new Error("Invalid image data format. Expected a data URL.");
    }
    const mimeType = imageParts[1];
    const base64ImageData = imageParts[2];

    // Call the Gemini API with the image, prompt, and a defined JSON schema for the response.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze the food in this image and generate a detailed recipe in ${language}. 
            The recipe should include:
            1. A common recipeName.
            2. A 'premiumName' (a creative, Michelin-star style name for the dish).
            3. A 'chefVibe' which must be exactly one of: 'Rustic', 'Elegant', 'Fiery', 'Fresh', or 'Modern'.
            4. A short description.
            5. A list of ingredients with measurements.
            6. Step-by-step instructions.
            7. Estimated nutritional information (calories, protein, carbs, fat).
            ${dietaryContext ? dietaryContext : ''} 
            Ensure the response is in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING, description: "The common name of the recipe." },
            premiumName: { type: Type.STRING, description: "A creative, high-end name for the dish." },
            chefVibe: {
              type: Type.STRING,
              enum: ['Rustic', 'Elegant', 'Fiery', 'Fresh', 'Modern'],
              description: "The visual/aesthetic vibe of the dish."
            },
            description: { type: Type.STRING, description: "A brief description of the dish." },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of ingredients with quantities."
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step cooking instructions."
            },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.STRING, description: "Estimated calories per serving." },
                protein: { type: Type.STRING, description: "Estimated protein content." },
                carbs: { type: Type.STRING, description: "Estimated carbohydrate content." },
                fat: { type: Type.STRING, description: "Estimated fat content." }
              },
              required: ["calories", "protein", "carbs", "fat"],
              description: "Estimated nutritional information."
            },
          },
          required: ["recipeName", "premiumName", "chefVibe", "description", "ingredients", "instructions", "nutrition"],
        },
      },
    });

    // The response text is expected to be a JSON string that matches the schema.
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);

    return { recipe: recipeData };

  } catch (error: any) {
    console.error("Error generating recipe from Gemini:", error);

    // Create more user-friendly error messages based on common API issues
    let userMessage = "An unexpected error occurred while generating the recipe. Please try again.";

    if (error.message) {
      if (error.message.includes('API_KEY')) {
        userMessage = "System Configuration Error: API Key is missing or invalid.";
      } else if (error.message.includes('Unauthorized')) {
        userMessage = "Please sign in to generate recipes.";
      } else if (error.message.includes('429')) {
        userMessage = "Daily recipe limit reached. Please try again tomorrow.";
      } else if (error.message.includes('503') || error.message.includes('500')) {
        userMessage = "The AI service is currently experiencing issues. Please try again later.";
      } else if (error.message.includes('SAFETY') || error.message.includes('blocked')) {
        userMessage = "The AI could not generate a recipe for this image. Please try a different photo containing clear food items.";
      } else if (error.message.includes('fetch failed') || error.message.includes('network')) {
        userMessage = "Network error. Please check your internet connection.";
      }
    }

    throw new Error(userMessage);
  }
};