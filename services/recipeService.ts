import { Recipe } from '../types';
import { supabase } from './supabaseClient';

export interface SavedRecipeDB {
    id: string;
    user_id: string;
    recipe_data: Recipe;
    created_at: string;
}

export const recipeService = {
    async saveRecipe(
recipe: Recipe, userId: string, visibility: any    ): Promise<Recipe | null> {
        if (!supabase) return null;

        const row = {
            user_id: userId,
            recipe_data: recipe,
        };

        const { data, error } = await supabase
            .from('saved_recipes')
            .insert(row)
            .select()
            .single();

        if (error) {
            console.error('Error saving recipe:', error);
            throw error;
        }

        if (data) {
            const savedRecipe = {
                ...data.recipe_data,
                id: data.id
            };
            return savedRecipe;
        }
        return null;
    },

    async getSavedRecipes(): Promise<Recipe[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('saved_recipes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching recipes:', error);
            throw error;
        }

        return (data || []).map((row: SavedRecipeDB) => ({
            ...row.recipe_data,
            id: row.id
        }));
    },

    async getPublicFeed(): Promise<Recipe[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('saved_recipes')
            .select('*')
            .contains('recipe_data', { visibility: 'public' }) 
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching public feed:', error);
            return [];
        }

        return (data || []).map((row: SavedRecipeDB) => ({
            ...row.recipe_data,
            id: row.id
        }));
    },

    async deleteRecipe(
        recipeId: string
    ): Promise<boolean> {
        if (!supabase) return false;

        const { error } = await supabase
            .from('saved_recipes')
            .delete()
            .eq('id', recipeId);

        if (error) {
            console.error('Error deleting recipe:', error);
            throw error;
        }

        return true;
    },

    async rateRecipe(recipeId: string, rating: number, accessToken: string) {
        if (!supabase) return null;

        const { data, error } = await supabase.functions.invoke('rate-recipe', {
            body: { recipeId, rating },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (error) {
            console.error('Error rating recipe:', error);
            throw error;
        }

        return data;
    }
};
