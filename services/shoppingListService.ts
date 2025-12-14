
import { supabase } from './supabaseClient';
import { ShoppingListItem } from '../components/ShoppingList';

export const shoppingListService = {
    async getShoppingList(userId: string): Promise<ShoppingListItem[]> {
        if (!supabase) return [];

        const { data, error } = await supabase
            .from('shopping_list_items')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching shopping list:', error);
            throw error;
        }

        // Map DB underscore fields to camelCase if needed, but here we can just ensure the DB uses compatible names or map them.
        // Our TS interface uses camelCase: { text, checked, recipeName }
        // DB columns suggested: text, checked, recipe_name

        return (data || []).map((item: any) => ({
            text: item.text,
            checked: item.checked,
            recipeName: item.recipe_name,
            // We might need to store the ID for updates if we want to update by ID efficiently, 
            // but the current App.tsx logic uses (text, recipeName) as a key.
            // To keep it compatible with existing App logic, we'll map it out. 
            // If we want to be more robust, we should probably add `id` to ShoppingListItem interface in the future.
        }));
    },

    async addItems(items: ShoppingListItem[], userId: string): Promise<void> {
        if (!supabase) return;

        const dbItems = items.map(item => ({
            user_id: userId,
            text: item.text,
            recipe_name: item.recipeName,
            checked: item.checked
        }));

        const { error } = await supabase
            .from('shopping_list_items')
            .insert(dbItems);

        if (error) {
            console.error('Error adding items to shopping list:', error);
            throw error;
        }
    },

    async toggleItem(text: string, recipeName: string, checked: boolean, userId: string): Promise<void> {
        if (!supabase) return;

        // This is a bit tricky without IDs if there are duplicates, but assuming (text, recipeName) is unique enough for now or user accepts all matches update.
        const { error } = await supabase
            .from('shopping_list_items')
            .update({ checked })
            .eq('user_id', userId)
            .eq('text', text)
            .eq('recipe_name', recipeName);

        if (error) {
            console.error('Error updating shopping list item:', error);
            throw error;
        }
    },

    async removeItem(text: string, recipeName: string, userId: string): Promise<void> {
        if (!supabase) return;

        const { error } = await supabase
            .from('shopping_list_items')
            .delete()
            .eq('user_id', userId)
            .eq('text', text)
            .eq('recipe_name', recipeName);

        if (error) {
            console.error('Error deleting shopping list item:', error);
            throw error;
        }
    },

    async clearList(userId: string): Promise<void> {
        if (!supabase) return;

        const { error } = await supabase
            .from('shopping_list_items')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error clearing shopping list:', error);
            throw error;
        }
    }
};
