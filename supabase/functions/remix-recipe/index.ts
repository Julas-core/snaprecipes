// supabase/functions/remix-recipe/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenAI, Type } from 'https://esm.sh/@google/genai@0.11.3'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Rate limiting config (e.g., 20 remixes per user, per hour)
const RATE_LIMIT_COUNT = 20
const RATE_LIMIT_WINDOW_SECONDS = 3600 // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { originalRecipe, prompt } = await req.json()
    if (!originalRecipe || !prompt) {
      return new Response(JSON.stringify({ error: 'Missing original recipe or prompt.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // Create a Supabase client with the user's authorization
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // --- START Rate Limiting Logic ---
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Rate limiting error: Could not get user.', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString()
    
    const { count, error: countError } = await supabaseClient
      .from('function_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('function_name', 'remix-recipe')
      .gte('created_at', windowStart)

    if (countError) {
      console.error('Rate limiting error: Could not count requests.', countError)
    } else if (count !== null && count >= RATE_LIMIT_COUNT) {
      return new Response(JSON.stringify({ error: 'Too many remix requests. Please try again later.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      })
    }

    await supabaseClient
      .from('function_logs')
      .insert({ user_id: user.id, function_name: 'remix-recipe' })
    // --- END Rate Limiting Logic ---
    
    // @ts-ignore
    const API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY is not set.')
    }
    
    const ai = new GoogleGenAI({ apiKey: API_KEY })

    const fullPrompt = `
      Original Recipe:
      ${JSON.stringify(originalRecipe, null, 2)}

      User Request:
      "${prompt}"

      Based on the user's request, please modify the original recipe. Provide the complete new recipe, including a potentially updated name and description.
      For example, if the request is "make it vegan", change ingredients like "butter" to "vegan butter" and "chicken" to "tofu".
      Ensure the output is a single, valid JSON object that strictly follows the provided schema.
    `
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING, description: "The modified name of the recipe." },
            description: { type: Type.STRING, description: "A brief description of the modified dish." },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of modified ingredients with quantities."
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Modified step-by-step cooking instructions."
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
