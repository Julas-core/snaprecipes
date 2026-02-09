// Example: services/feedService.ts
import { supabase } from './supabaseClient';
import { Recipe } from '../types';

export const feedService = {
  async getGlobalFeed(limit = 20): Promise<Recipe[]> {
    if (!supabase) return [];
    
    // We need to fetch recipes AND the author's profile info
    const { data, error } = await supabase
      .from('saved_recipes')
      .select(`
        *,
        author:profiles(username, avatar_url)
      `)
      // Assuming recipe_data stores the JSON, we might need a better schema later
      // But for now, we filter by a 'public' flag in your JSON or a column
      .eq('visibility', 'public') 
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    // Transform data to match your Recipe type
    return data.map(item => ({
        ...item.recipe_data,
        id: item.id,
        authorName: item.author?.username,
        authorAvatar: item.author?.avatar_url
    }));
  }
};