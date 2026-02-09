import React, { useEffect, useState } from 'react';
import { Recipe } from '../types';
import { recipeService } from '../services/recipeService';
import RecipeDisplay from '../components/RecipeDisplay';
import { UserProfile } from '../services/profileService';
import { ShoppingListItem } from '../components/ShoppingList';

interface ExploreProps {
    session: any;
    userProfile: UserProfile | null;
    shoppingList: ShoppingListItem[];
    onAddToShoppingList: (recipe: Recipe) => void;
}

const Explore: React.FC<ExploreProps> = ({ session, userProfile, shoppingList, onAddToShoppingList }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        const loadFeed = async () => {
            try {
                const data = await recipeService.getPublicFeed();
                setRecipes(data);
            } catch (error) {
                console.error('Failed to load feed', error);
            } finally {
                setLoading(false);
            }
        };
        loadFeed();
    }, []);

    // Helper to check if recipe is in shopping list
    const isRecipeInShoppingList = (recipe: Recipe) => {
        return shoppingList.some(item => item.recipeName === recipe.recipeName);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in pb-24">
             {!selectedRecipe && (
                 <div className="mb-8 text-center">
                    <h2 className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100">Explore Community Recipes</h2>
                    <p className="text-amber-700 dark:text-amber-400 mt-2">Discover what others are cooking</p>
                 </div>
             )}

             {selectedRecipe ? (
                 <div className="animate-fade-in">
                        <button 
                            onClick={() => setSelectedRecipe(null)}
                            className="mb-6 px-4 py-2 bg-amber-100 dark:bg-gray-800 text-amber-900 dark:text-amber-100 rounded-full flex items-center gap-2 hover:bg-amber-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <span>←</span> Back to Feed
                        </button>
                        <RecipeDisplay 
                            recipe={selectedRecipe} 
                            onAddToShoppingList={onAddToShoppingList}
                            isRecipeInShoppingList={isRecipeInShoppingList(selectedRecipe)}
                            // Read-only mode implied by missing onSave/onRate for now, or we can add them later
                            isSaved={false} 
                            canRate={!!session}
                        />
                 </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map(recipe => (
                        <div 
                            key={recipe.id}
                            onClick={() => setSelectedRecipe(recipe)}
                            className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 border border-transparent hover:border-amber-200 dark:hover:border-gray-700"
                        >
                            <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                {recipe.imageUrl ? (
                                    <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 font-serif italic">No Image</div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-serif font-bold text-xl text-gray-900 dark:text-white truncate mb-1">{recipe.recipeName}</h3>
                                {recipe.chefVibe && (
                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 mb-2 border border-amber-100 dark:border-amber-800">
                                        {recipe.chefVibe}
                                    </span>
                                )}
                                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 h-10">{recipe.description}</p>
                                
                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-amber-800 dark:text-amber-300">
                                            {(recipe.authorName || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        <span>{recipe.authorName || 'Chef'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>❤️ {recipe.likesCount || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {recipes.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-amber-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-amber-200 dark:border-gray-700">
                            <p className="text-amber-800 dark:text-amber-200 text-lg">No public recipes found yet.</p>
                            <p className="text-amber-600 dark:text-amber-400 text-sm mt-1">Be the first to share one!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Explore;
