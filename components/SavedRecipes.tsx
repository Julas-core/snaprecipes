import React from 'react';
import { Recipe } from '../types';
import { TrashIcon } from './icons';

interface SavedRecipesProps {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onDelete: (recipeId: string) => void;
}

const SavedRecipes: React.FC<SavedRecipesProps> = ({ recipes, onSelect, onDelete }) => {
  if (recipes.length === 0) return null;

  return (
    <div className="w-full mt-8 animate-fade-in">
      <h3 className="text-xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-4 px-2">Saved Recipes</h3>
      <div className="w-full overflow-x-auto pb-6 [scrollbar-width:thin] [scrollbar-color:#f59e0b_#fef3c7] dark:[scrollbar-color:#d97706_#374151] [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-amber-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500 dark:[&::-webkit-scrollbar-thumb]:bg-amber-700 hover:[&::-webkit-scrollbar-thumb]:bg-amber-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-amber-600">
        <div className="flex gap-4 px-2" style={{ minWidth: 'min-content' }}>
          {recipes.map((recipe) => (
            <div
              key={recipe.id || recipe.recipeName}
              onClick={() => onSelect(recipe)}
              className="relative flex-shrink-0 w-80 sm:w-96 aspect-video bg-amber-200 dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-black/50 overflow-hidden group cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]"
            >
              {/* Image Background */}
              {recipe.imageUrl ? (
                <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-100 dark:bg-gray-700 text-amber-800 dark:text-amber-200 font-serif">
                  No Image
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Title and Description */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-serif font-bold text-lg truncate shadow-black drop-shadow-md">
                  {recipe.recipeName}
                </h4>
                <p className="text-white/90 text-sm line-clamp-2 mt-1 shadow-black drop-shadow-md font-light">
                  {recipe.description}
                </p>
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (recipe.id) onDelete(recipe.id);
                }}
                className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                aria-label="Delete recipe"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Spacer to ensure last item isn't cut off if exactly 3 match width */}
          <div className="w-1 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  );
};

export default SavedRecipes;