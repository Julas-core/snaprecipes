// supabase/functions/rate-recipe/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { recipeId, rating } = await req.json()

    // Add some basic validation
    if (!recipeId) {
        throw new Error('Missing recipeId')
    }
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error('Rating must be a number between 1 and 5')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    // Upsert the rating
    const { error: upsertError } = await supabase
      .from('ratings')
      .upsert({ 
        recipe_id: recipeId, 
        user_id: user.id, 
        rating 
      })

    if (upsertError) throw upsertError

    // Calculate new average
    const { data: ratingsData, error: fetchError } = await supabase
      .from('ratings')
      .select('rating')
      .eq('recipe_id', recipeId)

    if (fetchError) throw fetchError

    const total = ratingsData.reduce((acc: any, curr: any) => acc + curr.rating, 0)
    const count = ratingsData.length
    const averageRating = count > 0 ? total / count : 0

    return new Response(
      JSON.stringify({ 
        averageRating, 
        ratingCount: count, 
        userRating: rating 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
