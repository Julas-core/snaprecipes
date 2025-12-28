// supabase/functions/generate-recipe/index.ts
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
// Use Deno-targeted build so bundler can resolve the dependency
import { GoogleGenerativeAI, SchemaType } from 'https://esm.sh/@google/generative-ai@0.11.3?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const DAILY_LIMIT = 5;
const WINDOW_SECONDS = 60 * 60 * 24; // 24h rolling window

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    // Fast path for CORS preflight
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  try {
    const { imageData, language = 'English', dietaryContext } = await req.json()
    if (!imageData) {
      return new Response(JSON.stringify({ error: 'Missing image data.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Require authenticated user (Bearer token provided by Supabase client)
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please sign in.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Enforce daily limit per user via function_logs table
    const windowStart = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString()
    const { count, error: countError } = await supabaseClient
      .from('function_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('function_name', 'generate-recipe')
      .gte('created_at', windowStart)

    if (countError) {
      console.error('Rate limiting count error:', countError)
    }

    if (count !== null && count >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: 'Daily recipe generation limit reached. Please try again tomorrow.', remaining: 0, limit: DAILY_LIMIT }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
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

    const ai = new GoogleGenerativeAI({ apiKey: API_KEY })

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
            text: `Analyze the food in this image and generate a detailed recipe in ${language}. ${dietaryContext ? `The user has these dietary preferences or restrictions: ${dietaryContext}. Please adapt the recipe accordingly.` : ''} The recipe should include a creative name, a short description, a list of ingredients with measurements, step-by-step instructions, and estimated nutritional information (calories, protein, carbs, fat). Ensure the response is in JSON format.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            recipeName: { type: SchemaType.STRING, description: "The name of the recipe." },
            description: { type: SchemaType.STRING, description: "A brief description of the dish." },
            ingredients: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "A list of ingredients with quantities."
            },
            instructions: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Step-by-step cooking instructions."
            },
            nutrition: {
              type: SchemaType.OBJECT,
              properties: {
                calories: { type: SchemaType.STRING, description: "Estimated calories per serving." },
                protein: { type: SchemaType.STRING, description: "Estimated protein content." },
                carbs: { type: SchemaType.STRING, description: "Estimated carbohydrate content." },
                fat: { type: SchemaType.STRING, description: "Estimated fat content." },
              },
              required: ["calories", "protein", "carbs", "fat"],
              description: "Estimated nutritional information."
            },
          },
          required: ["recipeName", "description", "ingredients", "instructions", "nutrition"],
        },
      },
    });
    
    const jsonText = response.text.trim();
    const recipeData = JSON.parse(jsonText);

    await supabaseClient
      .from('function_logs')
      .insert({ user_id: user.id, function_name: 'generate-recipe' })

    const remaining = Math.max(0, DAILY_LIMIT - ((count ?? 0) + 1));

    return new Response(JSON.stringify({ recipe: recipeData, remaining, limit: DAILY_LIMIT }), {
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
