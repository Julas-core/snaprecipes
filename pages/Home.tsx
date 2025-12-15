import React, { useState, useRef, useEffect } from 'react';
import { Recipe } from '../types';
import { generateRecipeFromImage } from '../services/geminiService';
import { CameraIcon, UploadIcon, WandIcon, XIcon } from '../components/icons';
import RecipeDisplay from '../components/RecipeDisplay';
import CameraView from '../components/CameraView';
import ImageCropper from '../components/ImageCropper';
import RecipeSkeleton from '../components/RecipeSkeleton';
import SavedRecipes from '../components/SavedRecipes';
import { trackEvent } from '../services/analytics';
import { recipeService } from '../services/recipeService';
import { UserProfile } from '../services/profileService';
import { ShoppingListItem } from '../components/ShoppingList';

interface HomeProps {
    session: any;
    userProfile: UserProfile | null;
    shoppingList: ShoppingListItem[];
    onAddToShoppingList: (recipe: Recipe) => void;
}

const Home: React.FC<HomeProps> = ({ session, userProfile, shoppingList, onAddToShoppingList }) => {
    const [image, setImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
    const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>('English');
    const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Track page view
    useEffect(() => {
        trackEvent('page_view_home');
    }, []);

    // Fetch saved recipes when session is available
    useEffect(() => {
        if (session?.user) {
            const loadSavedRecipes = async () => {
                try {
                    const recipes = await recipeService.getSavedRecipes();
                    setSavedRecipes(recipes);
                } catch (error) {
                    console.error("Failed to load saved recipes", error);
                }
            };
            loadSavedRecipes();
        } else {
            setSavedRecipes([]);
        }
    }, [session]);

    const handleSaveRecipe = async (recipe: Recipe) => {
        if (!session?.user) {
            alert("Please sign in to save recipes!");
            return;
        }

        // Check if already saved
        const exists = savedRecipes.some(r => r.recipeName === recipe.recipeName);

        if (exists) {
            // Toggle off (remove)
            const savedRecipe = savedRecipes.find(r => r.recipeName === recipe.recipeName);
            if (savedRecipe?.id) {
                try {
                    await recipeService.deleteRecipe(savedRecipe.id);
                    setSavedRecipes(prev => prev.filter(r => r.id !== savedRecipe.id));
                } catch (e) {
                    console.error("Failed to delete recipe", e);
                    setError("Failed to remove recipe.");
                }
            }
        } else {
            // Toggle on (add)
            try {
                const saved = await recipeService.saveRecipe(recipe, session.user.id);
                if (saved) {
                    setSavedRecipes(prev => [saved, ...prev]);
                    // Update active recipe with ID if needed
                    if (activeRecipe && !activeRecipe.id) {
                        setActiveRecipe(saved);
                    }
                }
            } catch (e) {
                console.error("Failed to save recipe", e);
                setError("Failed to save recipe.");
            }
        }
    };

    const handleDeleteSavedRecipe = async (recipeId: string) => {
        if (!session?.user) return;
        try {
            await recipeService.deleteRecipe(recipeId);
            setSavedRecipes(prev => prev.filter(r => r.id !== recipeId));
        } catch (e) {
            console.error("Failed to delete recipe", e);
        }
    };

    const handleSelectSavedRecipe = (recipe: Recipe) => {
        setActiveRecipe(recipe);
        if (recipe.imageUrl) {
            setImage(recipe.imageUrl);
            setImageUrl(recipe.imageUrl);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsReadingFile(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result as string);
                resetState(true);
                setIsReadingFile(false);
            };
            reader.onerror = () => {
                setError("Failed to read the image file. Please try again.");
                setIsReadingFile(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetRecipe = async () => {
        if (!image) return;

        setIsLoading(true);
        setError(null);
        setActiveRecipe(null);

        try {
            const dietaryContext = userProfile?.dietary_prefs?.length
                ? `The user has the following dietary preferences/restrictions: ${userProfile.dietary_prefs.join(', ')}. Please adapt the recipe to be suitable for them.`
                : undefined;

            const generatedRecipe = await generateRecipeFromImage(image, language, dietaryContext);
            setActiveRecipe({ ...generatedRecipe, imageUrl: image });
            setImageUrl(image);
            trackEvent('generate_recipe', { success: true, recipe_name: generatedRecipe.recipeName });
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
            trackEvent('generate_recipe', { success: false, error: e.message });
        } finally {
            setIsLoading(false);
        }
    };

    const resetState = (keepImageToCrop = false) => {
        setImage(null);
        setImageUrl(null);
        if (!keepImageToCrop) setImageToCrop(null);
        setActiveRecipe(null);
        setError(null);
        setIsLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCameraCapture = (imageDataUrl: string) => {
        setImageToCrop(imageDataUrl);
        setIsCameraOpen(false);
        resetState(true);
    };

    const handleCropComplete = (croppedImage: string) => {
        setImage(croppedImage);
        setImageToCrop(null);
    };

    const handleCropCancel = () => {
        setImageToCrop(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const isCurrentRecipeInShoppingList = activeRecipe ? shoppingList.some(item => item.recipeName === activeRecipe.recipeName) : false;
    const isCurrentRecipeSaved = activeRecipe ? savedRecipes.some(r => r.recipeName === activeRecipe.recipeName) : false;

    return (
        <div className="w-full flex-grow flex flex-col justify-center items-center">
            {/* Hero Title Section */}
            <div className="w-full text-center mb-10 no-print">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-900 dark:text-amber-500 drop-shadow-sm font-serif">
                    Snap-a-Recipe
                </h1>
                <p className="mt-2 text-lg sm:text-xl text-amber-700 dark:text-amber-300">
                    Turn your food photos into delicious recipes!
                </p>
            </div>

            {/* Error Message Alert */}
            {error && (
                <div className="w-full max-w-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 shadow-sm animate-fade-in" role="alert">
                    <strong className="font-bold">Oops! </strong>
                    <span className="block sm:inline">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500 hover:text-red-800 transition-colors"
                        aria-label="Close error message"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            {isCameraOpen && <CameraView onCapture={handleCameraCapture} onCancel={() => setIsCameraOpen(false)} />}

            {imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}

            {!image && !imageToCrop && !activeRecipe && (
                <div className="w-full max-w-4xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg dark:shadow-black/30 text-center animate-fade-in no-print">
                    <h2 className="text-2xl font-semibold mb-4 font-serif text-amber-900 dark:text-amber-100">Get Started</h2>
                    <p className="text-amber-800 dark:text-amber-200 mb-6">Choose how to provide an image of your meal:</p>

                    <div className="max-w-xs mx-auto mb-6">
                        <label htmlFor="language-select" className="block text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">Recipe Language</label>
                        <select
                            id="language-select"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-amber-300 dark:border-gray-600 dark:text-white rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow"
                        >
                            <option value="English">English</option>
                            <option value="Spanish">Español</option>
                            <option value="French">Français</option>
                            <option value="German">Deutsch</option>
                            <option value="Italian">Italiano</option>
                            <option value="Arabic">العربية</option>
                            <option value="Tigrigna">ትግርኛ</option>
                            <option value="Amharic">አማርኛ</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => setIsCameraOpen(true)} disabled={isReadingFile} className="flex items-center justify-center gap-3 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow-md hover:bg-amber-600 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 disabled:bg-amber-400 disabled:cursor-not-allowed">
                            <CameraIcon className="w-6 h-6" />
                            Take a Photo
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} disabled={isReadingFile} className="flex items-center justify-center gap-3 px-6 py-3 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-opacity-75 disabled:bg-amber-700 disabled:cursor-wait">
                            {isReadingFile ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="w-6 h-6" />
                                    <span>Upload Image</span>
                                </>
                            )}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>

                    <SavedRecipes
                        recipes={savedRecipes}
                        onSelect={handleSelectSavedRecipe}
                        onDelete={handleDeleteSavedRecipe}
                    />
                </div>
            )}

            {(image || activeRecipe) && (
                <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-start print:block">
                    {/* Image Column */}
                    <div className="relative w-full animate-fade-in no-print">
                        {image && (
                            <>
                                <div className="p-2 bg-white rounded-2xl shadow-2xl shadow-amber-900/20">
                                    <img src={image} alt="Selected meal" className="rounded-xl object-cover w-full aspect-square lg:sticky lg:top-8" />
                                </div>
                                <button onClick={() => resetState()} className="absolute -top-3 -right-3 bg-white text-amber-800 rounded-full p-2 shadow-lg hover:bg-amber-100 transition-transform transform hover:scale-110">
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Content Column */}
                    <div className="w-full mt-8 lg:mt-0 print:mt-0">
                        {isLoading ? (
                            <RecipeSkeleton />
                        ) : activeRecipe ? (
                            <div className="animate-fade-in">
                                <RecipeDisplay
                                    recipe={activeRecipe}
                                    onAddToShoppingList={onAddToShoppingList}
                                    isRecipeInShoppingList={isCurrentRecipeInShoppingList}
                                    onSave={handleSaveRecipe}
                                    isSaved={isCurrentRecipeSaved}
                                />
                            </div>
                        ) : (
                            <div className="w-full text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg animate-fade-in flex flex-col justify-center h-full no-print">
                                <h2 className="text-2xl font-semibold mb-4 font-serif text-amber-900 dark:text-amber-100">Image Ready!</h2>
                                <p className="text-amber-800 dark:text-amber-200 mb-8 max-w-sm mx-auto">Your photo is perfectly cropped and ready to be transformed into a delicious recipe.</p>
                                <button onClick={handleGetRecipe} className="group flex items-center justify-center mx-auto gap-3 px-8 py-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xl font-bold rounded-xl shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 animate-pulse-glow">
                                    <WandIcon className="w-7 h-7 transition-transform duration-300 group-hover:rotate-12" />
                                    Generate Recipe
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
