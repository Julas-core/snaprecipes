// supabase/functions/generate-recipe/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenAI, Type } from 'https://esm.sh/@google/genai@0.11.3'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageData } = await req.json()
    if (!imageData) {
      return new Response(JSON.stringify({ error: 'Missing image data.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // The imageData is a data URL, e.g., "data:image/jpeg;base64,..."
    // We need to extract the mime type and the base64 data.
    const imageParts = imageData.match(/^data:(.+);base64,(.+)$/);
    if (!imageParts || imageParts.length !== 3) {
      return new Response(JSON.stringify({ error: 'Invalid image data format.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    const mimeType = imageParts[1];
    const base64ImageData = imageParts[2];

    // @ts-ignore
    const API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY is not set.')
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY })

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
            text: `Analyze the food in this image and generate a detailed recipe. 
                   The recipe should include a creative name, a short description, 
                   a list of ingredients with measurements, and step-by-step instructions. 
                   Ensure the response is in JSON format.`,
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
    
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);

    return new Response(JSON.stringify(recipeData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in Edge Function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
