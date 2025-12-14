import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

/**
 * Generates a recipe from an image by calling the Gemini API directly.
 * @param {string} imageData - The base64 encoded data URL of the image.
 * @param {string} language - The language for the recipe to be generated in.
 * @returns {Promise<Recipe>} A promise that resolves to the generated recipe.
 */
export const generateRecipeFromImage = async (
  imageData: string,
  language: string = 'English',
  dietaryContext?: string
): Promise<Recipe> => {
  try {
    // Access the API key using Vite's standard import.meta.env
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
            text: `Analyze the food in this image and generate a detailed recipe in ${language}. The recipe should include a creative name, a short description, a list of ingredients with measurements, and step-by-step instructions. ${dietaryContext ? dietaryContext : ''} Ensure the response is in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING, description: "The name of the recipe." },
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
          },
          required: ["recipeName", "description", "ingredients", "instructions"],
        },
      },
    });

    // The response text is expected to be a JSON string that matches the schema.
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);

    return recipeData;

  } catch (error: any) {
    console.error("Error generating recipe from Gemini:", error);

    // Create more user-friendly error messages based on common API issues
    let userMessage = "An unexpected error occurred while generating the recipe. Please try again.";

    if (error.message) {
      if (error.message.includes('API_KEY')) {
        userMessage = "System Configuration Error: API Key is missing or invalid.";
      } else if (error.message.includes('429')) {
        userMessage = "We are receiving too many requests right now. Please wait a moment and try again.";
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