import React, { useState, useMemo } from 'react';
import { Recipe } from '../types';
import { KitchenIcon, PrintIcon, ShareIcon, XIcon, CopyIcon, ShoppingCartIcon, HeartIcon } from './icons';

interface RecipeDisplayProps {
  recipe: Recipe;
  onAddToShoppingList?: (recipe: Recipe) => void;
  isRecipeInShoppingList?: boolean;
  onSave?: (recipe: Recipe) => void;
  isSaved?: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onAddToShoppingList, isRecipeInShoppingList, onSave, isSaved }) => {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isKitchenMode, setIsKitchenMode] = useState(false);
  const [showIngredients, setShowIngredients] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy Text');
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions'>('ingredients');


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

  const handlePrint = () => window.print();
  
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
            className="bg-amber-50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full m-4 relative flex flex-col max-h-[85vh]" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 id="ingredients-heading" className="text-2xl font-serif font-bold text-amber-900">Ingredients ({recipe.ingredients.length})</h3>
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
            <div className="bg-amber-50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-serif font-bold text-amber-900 mb-4 text-center">Share Recipe</h3>
                <div className="flex flex-col gap-4">
                    {navigator.share && (
                        <button onClick={handleNativeShare} className="w-full text-center px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-all">
                            Share Natively
                        </button>
                    )}
                    <button onClick={handleCopyToClipboard} className="w-full text-center px-4 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900 transition-all flex items-center justify-center gap-2">
                        <CopyIcon className="w-5 h-5" />
                        {copyButtonText}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Kitchen Mode */}
      {isKitchenMode && (
        <div className="fixed inset-0 bg-amber-50 z-50 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
          <div className="w-full max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-serif text-amber-900 mb-2">{allStepsCompleted ? "Enjoy your meal!" : `Step ${currentStepIndex + 1} of ${recipe.instructions.length}`}</h2>
            <p className="text-xl sm:text-2xl md:text-3xl text-amber-800 font-light min-h-[10rem] sm:min-h-[12rem] flex items-center justify-center p-4">
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 w-full print:bg-white print:shadow-none print:p-0">
        <div className="text-center print:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 font-serif mb-2 print:text-4xl">{recipe.recipeName}</h2>
          <p className="text-amber-800/90 text-center max-w-3xl mx-auto mb-6 print:text-black print:text-left print:max-w-none print:mx-0 break-words">
            {recipe.description}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 border-t border-b border-amber-200 py-4 no-print">
            <button onClick={() => setIsKitchenMode(true)} className="flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 bg-amber-100 text-amber-800 font-semibold rounded-lg shadow-sm hover:bg-amber-200 transition-all"><KitchenIcon className="w-5 h-5"/> Kitchen Mode</button>
            {onAddToShoppingList && (
                <button 
                  onClick={() => onAddToShoppingList(recipe)}
                  disabled={isRecipeInShoppingList}
                  className="flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 bg-amber-100 text-amber-800 font-semibold rounded-lg shadow-sm hover:bg-amber-200 transition-all disabled:bg-amber-200/50 disabled:text-amber-800/60 disabled:cursor-not-allowed">
                  <ShoppingCartIcon className="w-5 h-5"/>
                  {isRecipeInShoppingList ? 'Added' : 'Add to List'}
                </button>
            )}
            {onSave && (
              <button 
                onClick={() => onSave(recipe)}
                className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 ${isSaved ? 'bg-red-100 text-red-800 hover:bg-red-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'} font-semibold rounded-lg shadow-sm transition-all`}
              >
                <HeartIcon className="w-5 h-5" filled={isSaved} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 bg-amber-100 text-amber-800 font-semibold rounded-lg shadow-sm hover:bg-amber-200 transition-all"><PrintIcon className="w-5 h-5"/> Print</button>
            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 bg-amber-100 text-amber-800 font-semibold rounded-lg shadow-sm hover:bg-amber-200 transition-all"><ShareIcon className="w-5 h-5"/> Share</button>
        </div>

        {/* Ingredients and Instructions */}
        <div className="no-print">
            <div className="border-b border-amber-300 mb-6">
                <div className="flex justify-center space-x-2 md:space-x-6 -mb-px">
                   <button onClick={() => setActiveTab('ingredients')} className={`py-3 px-4 font-semibold text-lg border-b-4 transition-colors ${activeTab === 'ingredients' ? 'text-amber-800 border-amber-500' : 'text-amber-600 border-transparent hover:text-amber-800'}`}>Ingredients</button>
                   <button onClick={() => setActiveTab('instructions')} className={`py-3 px-4 font-semibold text-lg border-b-4 transition-colors ${activeTab === 'instructions' ? 'text-amber-800 border-amber-500' : 'text-amber-600 border-transparent hover:text-amber-800'}`}>Instructions</button>
                </div>
            </div>
            
            {activeTab === 'ingredients' && (
                <ul className="space-y-4 mt-6 animate-fade-in-fast">
                    {recipe.ingredients.map((ingredient, i) => (
                        <li key={i} onClick={() => handleToggleIngredient(i)} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-amber-100/70">
                            <div className={`w-6 h-6 rounded-md border-2 ${checkedIngredients.has(i) ? 'bg-amber-600 border-amber-600' : 'border-amber-400'} flex items-center justify-center flex-shrink-0 transition-colors`}>
                                {checkedIngredients.has(i) && (
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <span className={`flex-grow transition-all ${checkedIngredients.has(i) ? 'line-through text-amber-800/60' : 'text-amber-800'}`}>{ingredient}</span>
                        </li>
                    ))}
                </ul>
            )}
            {activeTab === 'instructions' && (
                <ol className="space-y-4 mt-6 list-decimal list-inside text-amber-800/90 marker:text-amber-600 marker:font-bold animate-fade-in-fast">
                    {recipe.instructions.map((step, i) => (
                        <li key={i} onClick={() => handleToggleStep(i)} className={`p-2 rounded-lg transition-colors ${!isKitchenMode ? 'cursor-pointer hover:bg-amber-100/70' : ''}`}>
                            <span className={`transition-all ${completedSteps.has(i) ? 'line-through text-amber-800/50' : ''} break-words`}>
                                {step}
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </div>

        {/* Print-only View */}
        <div className="hidden print:block">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 font-serif text-black border-b border-gray-300 pb-2">Ingredients</h3>
            <ul className="space-y-2 list-disc list-inside text-base text-black">
              {recipe.ingredients.map((ing, i) => (
                <li key={`print-ing-${i}`} className="mb-1">{ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-4 font-serif text-black border-b border-gray-300 pb-2">Instructions</h3>
            <ol className="space-y-3 list-decimal list-inside text-base text-black">
              {recipe.instructions.map((step, i) => (
                <li key={`print-inst-${i}`} className="mb-2 leading-relaxed break-words">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

      </div>
    </>
  );
};

export default RecipeDisplay;