import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { KitchenIcon, PrintIcon, ShareIcon, XIcon, CopyIcon, ShoppingCartIcon, HeartIcon, SparklesIcon } from './icons';
import RecipePostcard from './RecipePostcard';

const vibeStyles: Record<string, {
  bg: string;
  text: string;
  border: string;
  accent: string;
  iconColor: string;
  card: string;
  tabActive: string;
}> = {
  Rustic: {
    bg: 'bg-amber-50 dark:bg-stone-900',
    text: 'text-amber-900 dark:text-stone-100',
    border: 'border-amber-200 dark:border-stone-700',
    accent: 'bg-amber-100 dark:bg-stone-800',
    iconColor: 'text-amber-700 dark:text-stone-400',
    card: 'bg-white/90 dark:bg-stone-800/90',
    tabActive: 'text-amber-800 dark:text-amber-400 border-amber-500'
  },
  Elegant: {
    bg: 'bg-zinc-50 dark:bg-black',
    text: 'text-zinc-900 dark:text-zinc-100',
    border: 'border-zinc-300 dark:border-zinc-800',
    accent: 'bg-white dark:bg-zinc-900',
    iconColor: 'text-yellow-600 dark:text-yellow-500',
    card: 'bg-white/95 dark:bg-zinc-900/95',
    tabActive: 'text-zinc-800 dark:text-yellow-500 border-yellow-500'
  },
  Fiery: {
    bg: 'bg-orange-50 dark:bg-red-950',
    text: 'text-orange-900 dark:text-orange-100',
    border: 'border-orange-200 dark:border-red-900',
    accent: 'bg-orange-100 dark:bg-red-900/50',
    iconColor: 'text-orange-600 dark:text-red-500',
    card: 'bg-white/90 dark:bg-red-900/40',
    tabActive: 'text-orange-800 dark:text-orange-400 border-orange-500'
  },
  Fresh: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    text: 'text-emerald-900 dark:text-emerald-100',
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    card: 'bg-white/90 dark:bg-emerald-900/40',
    tabActive: 'text-emerald-800 dark:text-emerald-400 border-emerald-500'
  },
  Modern: {
    bg: 'bg-slate-50 dark:bg-slate-950',
    text: 'text-slate-900 dark:text-slate-100',
    border: 'border-slate-300 dark:border-slate-800',
    accent: 'bg-slate-100 dark:bg-slate-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    card: 'bg-white/90 dark:bg-slate-900/90',
    tabActive: 'text-slate-800 dark:text-blue-400 border-blue-500'
  }
};

const StarIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

type RecipeVisibility = 'public' | 'private';

interface RecipeDisplayProps {
  recipe: Recipe;
  onAddToShoppingList?: (recipe: Recipe) => void;
  isRecipeInShoppingList?: boolean;
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
  onRate?: (rating: number) => void;
  canRate?: boolean;
  visibility?: RecipeVisibility;
  onChangeVisibility?: (visibility: RecipeVisibility) => void;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onAddToShoppingList, isRecipeInShoppingList, onSave, isSaved, onRate, canRate, visibility = 'public', onChangeVisibility }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isKitchenMode, setIsKitchenMode] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPostcardOpen, setIsPostcardOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Text');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');
  const [pendingRating, setPendingRating] = useState<number | null>(null);

  const vibe = recipe.chefVibe || 'Rustic';
  const styles = vibeStyles[vibe] || vibeStyles.Rustic;
  const currentStepIndex = recipe.instructions.findIndex((_, i) => !completedSteps.has(i));
  const allStepsCompleted = currentStepIndex === -1;

  const handleToggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleToggleStep = (index: number) => {
    if (isKitchenMode) {
      if (index === currentStepIndex) {
        setCompletedSteps(prev => new Set(prev).add(index));
      }
    } else {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    }
  };

  const resetSteps = () => {
    setCompletedSteps(new Set());
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    // Set the title to the recipe name so the PDF file is named correctly
    document.title = `${recipe.recipeName} - Recipe`;
    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const fullRecipeText = useMemo(() => {
    return `Recipe: ${recipe.recipeName}\n\n${recipe.description}\n\nIngredients:\n- ${recipe.ingredients.join('\n- ')}\n\nInstructions:\n${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}`;
  }, [recipe]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullRecipeText);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Text'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopyButtonText('Failed to copy');
      setTimeout(() => setCopyButtonText('Copy Text'), 2000);
    }
  };

  const handleNativeShare = async () => {
    const shareTitle = `Recipe: ${recipe.recipeName}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: fullRecipeText,
        });
        setIsShareModalOpen(false);
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  const renderStars = () => {
    const userRating = pendingRating ?? recipe.userRating;
    const displayRating = userRating ?? recipe.averageRating ?? 0;
    const countLabel = recipe.ratingCount ? `(${recipe.ratingCount})` : '(no ratings yet)';

    return (
      <div className="flex items-center gap-3 no-print">
        <div className="flex items-center gap-1" aria-label={`Rating ${displayRating} out of 5`}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = displayRating >= star - 0.25; // simple threshold to show average
            return (
              <button
                key={star}
                type="button"
                disabled={!onRate || !canRate}
                onClick={() => {
                  if (!onRate || !canRate) return;
                  setPendingRating(star);
                  onRate(star);
                }}
                className={`p-1 rounded transition-colors ${onRate && canRate ? 'hover:scale-105 hover:text-amber-600' : 'cursor-not-allowed text-amber-400/60'}`}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <StarIcon className="w-6 h-6" filled={filled} />
              </button>
            );
          })}
        </div>
        <div className="text-sm text-amber-700 dark:text-amber-300 font-semibold">
          {displayRating ? displayRating.toFixed(1) : '0.0'} {countLabel}
        </div>
        {!canRate && onRate && (
          <span className="text-xs text-amber-700/80 dark:text-amber-300/80">Sign in to rate</span>
        )}
      </div>
    );
  };


  return (
    <>
      {/* Ingredients Modal for Kitchen Mode */}
      {showIngredients && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4"
          onClick={() => setShowIngredients(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ingredients-heading"
        >
          <div
            className="bg-amber-50 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full m-4 relative flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h3 id="ingredients-heading" className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100">Ingredients ({recipe.ingredients.length})</h3>
              <button
                onClick={() => setShowIngredients(false)}
                className="p-1 rounded-full text-amber-700 hover:bg-amber-200 transition-colors"
                aria-label="Close ingredients list"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <ul className="space-y-3 overflow-y-auto">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-2 h-2 bg-amber-400 rounded-full flex-shrink-0"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4" onClick={() => setIsShareModalOpen(false)}>
          <div className="bg-amber-50 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-4 text-center">Share Recipe</h3>
            <div className="flex flex-col gap-4">
              {navigator.share && (
                <button onClick={handleNativeShare} className="w-full text-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-all">
                  Share Natively
                </button>
              )}
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  setIsPostcardOpen(true);
                }}
                className={`w-full text-center px-4 py-2 ${styles.accent} ${styles.iconColor} font-bold rounded-lg shadow-md hover:opacity-80 transition-all flex items-center justify-center gap-2`}
              >
                <SparklesIcon className="w-5 h-5" />
                View Chef's Postcard
              </button>
              <button onClick={handleCopyToClipboard} className="w-full text-center px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900 transition-all flex items-center justify-center gap-2">
                <CopyIcon className="w-5 h-5" />
                {copyButtonText}
              </button>
            </div>
          </div>
        </div>
      )}

      <RecipePostcard
        recipe={recipe}
        isOpen={isPostcardOpen}
        onClose={() => setIsPostcardOpen(false)}
      />

      {/* Kitchen Mode */}
      {isKitchenMode && (
        <div className="fixed inset-0 bg-amber-50 dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
          <div className="w-full max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-serif text-amber-900 dark:text-amber-100 mb-2">{allStepsCompleted ? "Enjoy your meal!" : `Step ${currentStepIndex + 1} of ${recipe.instructions.length}`}</h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-amber-800 dark:text-amber-200 font-light min-h-[10rem] sm:min-h-[12rem] flex items-center justify-center p-4">
              {allStepsCompleted ? "You've successfully completed all the steps." : recipe.instructions[currentStepIndex]}
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
              {!allStepsCompleted && (
                <button onClick={() => handleToggleStep(currentStepIndex)} className="px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-green-700 transition transform hover:scale-105">
                  Mark as Complete
                </button>
              )}
              {allStepsCompleted && (
                <button onClick={resetSteps} className="px-8 py-4 bg-amber-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-amber-700 transition transform hover:scale-105">
                  Start Over
                </button>
              )}
            </div>
          </div>
          <div className="absolute bottom-6 flex flex-wrap justify-center gap-4">
            <button onClick={() => setShowIngredients(true)} className="px-4 py-2 bg-amber-200 text-amber-800 font-semibold rounded-lg shadow hover:bg-amber-300 transition">View Ingredients</button>
            <button onClick={() => setIsKitchenMode(false)} className="px-4 py-2 bg-red-200 text-red-800 font-semibold rounded-lg shadow hover:bg-red-300 transition">Exit Kitchen Mode</button>
          </div>
        </div>
      )}

      {/* Main Recipe Display */}
      <div className={`${styles.card} backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-black/30 p-6 md:p-8 w-full print:bg-white print:shadow-none print:p-0 transition-colors duration-500`}>
        <div className="text-center print:text-left">
          {recipe.premiumName && (
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-2 ${styles.accent} ${styles.iconColor} animate-fade-in`}>
              Chef's Special: {vibe}
            </span>
          )}
          <h2 className={`text-3xl md:text-4xl font-bold ${styles.text} font-serif mb-2 print:text-4xl`}>
            {recipe.premiumName || recipe.recipeName}
          </h2>
          {recipe.premiumName && (
            <p className={`text-sm italic mb-4 ${styles.iconColor} opacity-80`}>
              Originally known as {recipe.recipeName}
            </p>
          )}
          <p className={`${styles.text} opacity-90 text-center max-w-3xl mx-auto mb-6 print:text-black print:text-left print:max-w-none print:mx-0 break-words`}>
            {recipe.description}
          </p>
          {renderStars()}
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 border-t border-b ${styles.border} py-4 no-print`}>
          <button onClick={() => setIsKitchenMode(true)} className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 ${styles.accent} ${styles.text} font-semibold rounded-lg shadow-sm hover:opacity-80 transition-all`}><KitchenIcon className="w-5 h-5" /> Kitchen Mode</button>
          {onAddToShoppingList && (
            <button
              onClick={() => onAddToShoppingList(recipe)}
              disabled={isRecipeInShoppingList}
              className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 ${styles.accent} ${styles.text} font-semibold rounded-lg shadow-sm hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}>
              <ShoppingCartIcon className="w-5 h-5" />
              {isRecipeInShoppingList ? 'Added' : 'Add to List'}
            </button>
          )}
          {onSave && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-gray-700 px-3 py-2 rounded-lg border border-amber-200 dark:border-gray-600 shadow-sm">
              <label className="text-sm font-semibold text-amber-800 dark:text-amber-100" htmlFor="visibility-select">Visibility</label>
              <select
                id="visibility-select"
                value={visibility}
                onChange={(e) => onChangeVisibility?.(e.target.value as RecipeVisibility)}
                className="bg-white dark:bg-gray-800 text-amber-800 dark:text-amber-100 text-sm rounded-md border border-amber-200 dark:border-gray-600 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          )}
          {onSave && (
            <button
              onClick={() => onSave(recipe)}
              className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 ${isSaved ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' : `${styles.accent} ${styles.text}`} font-semibold rounded-lg shadow-sm hover:opacity-80 transition-all`}
            >
              <HeartIcon className="w-5 h-5" filled={isSaved} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          )}
          <button onClick={handlePrint} className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 ${styles.accent} ${styles.text} font-semibold rounded-lg shadow-sm hover:opacity-80 transition-all`}><PrintIcon className="w-5 h-5" /> Print</button>
          <button onClick={() => setIsShareModalOpen(true)} className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 ${styles.accent} ${styles.text} font-semibold rounded-lg shadow-sm hover:opacity-80 transition-all`}><ShareIcon className="w-5 h-5" /> Share</button>
        </div>

        {/* Nutrition Info */}
        {recipe.nutrition && (
          <div className="flex flex-wrap justify-center gap-4 mb-8 no-print animate-fade-in">
            <div className={`${styles.accent} rounded-xl p-4 text-center min-w-[80px] border ${styles.border} shadow-sm`}>
              <span className={`block text-xs ${styles.iconColor} font-bold uppercase tracking-widest mb-1`}>Calories</span>
              <span className={`block text-xl font-bold ${styles.text}`}>{recipe.nutrition.calories}</span>
            </div>
            <div className={`${styles.accent} rounded-xl p-4 text-center min-w-[80px] border ${styles.border} shadow-sm`}>
              <span className={`block text-xs ${styles.iconColor} font-bold uppercase tracking-widest mb-1`}>Protein</span>
              <span className={`block text-xl font-bold ${styles.text}`}>{recipe.nutrition.protein}</span>
            </div>
            <div className={`${styles.accent} rounded-xl p-4 text-center min-w-[80px] border ${styles.border} shadow-sm`}>
              <span className={`block text-xs ${styles.iconColor} font-bold uppercase tracking-widest mb-1`}>Carbs</span>
              <span className={`block text-xl font-bold ${styles.text}`}>{recipe.nutrition.carbs}</span>
            </div>
            <div className={`${styles.accent} rounded-xl p-4 text-center min-w-[80px] border ${styles.border} shadow-sm`}>
              <span className={`block text-xs ${styles.iconColor} font-bold uppercase tracking-widest mb-1`}>Fat</span>
              <span className={`block text-xl font-bold ${styles.text}`}>{recipe.nutrition.fat}</span>
            </div>
          </div>
        )}

        {/* Ingredients and Instructions */}
        <div className="no-print">
          <div className={`border-b ${styles.border} mb-6`}>
            <div className="flex justify-center space-x-2 md:space-x-6 -mb-px">
              <button onClick={() => setActiveTab('ingredients')} className={`py-3 px-4 font-semibold text-lg border-b-4 transition-colors ${activeTab === 'ingredients' ? styles.tabActive : `text-gray-400 border-transparent hover:${styles.text}`}`}>Ingredients</button>
              <button onClick={() => setActiveTab('instructions')} className={`py-3 px-4 font-semibold text-lg border-b-4 transition-colors ${activeTab === 'instructions' ? styles.tabActive : `text-gray-400 border-transparent hover:${styles.text}`}`}>Instructions</button>
            </div>
          </div>

          {activeTab === 'ingredients' && (
            <ul className="space-y-4 mt-6 animate-fade-in-fast">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i} onClick={() => handleToggleIngredient(i)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:${styles.accent}`}>
                  <div className={`w-6 h-6 rounded-md border-2 ${checkedIngredients.has(i) ? styles.iconColor.replace('text-', 'bg-') : styles.border} flex items-center justify-center flex-shrink-0 transition-colors`}>
                    {checkedIngredients.has(i) && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-grow transition-all ${checkedIngredients.has(i) ? 'line-through opacity-50' : styles.text}`}>{ingredient}</span>
                </li>
              ))}
            </ul>
          )}
          {activeTab === 'instructions' && (
            <ol className={`space-y-4 mt-6 list-decimal list-inside ${styles.text} marker:${styles.iconColor} marker:font-bold animate-fade-in-fast`}>
              {recipe.instructions.map((step, i) => (
                <li key={i} onClick={() => handleToggleStep(i)} className={`p-2 rounded-lg transition-colors ${!isKitchenMode ? `cursor-pointer hover:${styles.accent}` : ''}`}>
                  <span className={`transition-all ${completedSteps.has(i) ? 'line-through opacity-50' : ''} break-words`}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Print-only View */}
        <div className="hidden print:block">
          {recipe.imageUrl && (
            <div className="mb-6">
              <img
                src={recipe.imageUrl}
                alt={recipe.recipeName}
                className="w-full max-h-80 object-cover rounded-xl border border-gray-200"
              />
            </div>
          )}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 font-serif text-yellow border-b border-gray-300 pb-2">
              Ingredients
            </h3>
            <ul className="space-y-2 list-disc list-inside text-base text-black">
              {recipe.ingredients.map((ing, i) => (
                <li key={`print-ing-${i}`} className="mb-1">{ing}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </>
  );
};

export default RecipeDisplay;