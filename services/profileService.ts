
import { supabase } from './supabaseClient';

export interface UserProfile {
    id: string; // Matches auth.users id
    dietary_prefs: string[];
}

export const profileService = {
    async getProfile(userId: string): Promise<UserProfile | null> {
        if (!supabase) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // If code is PGRST116 (JSON object requested, multiple (or no) rows returned), it might mean no profile exists yet.
            // We can treat it as null (no prefs set yet).
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Error fetching profile:', error);
            return null;
        }

        return data as UserProfile;
    },

    async updateProfile(userId: string, prefs: string[]): Promise<UserProfile | null> {
        if (!supabase) return null;

        // Upsert: update if exists, insert if not
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                dietary_prefs: prefs,
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }

        return data as UserProfile;
    }
};
