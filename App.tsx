import React, { useState, useRef, useEffect } from 'react';
import { Recipe } from './types';
import { generateRecipeFromImage } from './services/geminiService';
import { CameraIcon, UploadIcon, WandIcon, XIcon } from './components/icons';
import RecipeDisplay from './components/RecipeDisplay';
import CameraView from './components/CameraView';
import ImageCropper from './components/ImageCropper';
import RecipeSkeleton from './components/RecipeSkeleton';
import Footer from './components/Footer';
import Header from './components/Header';
import LegalPage from './components/LegalPage';
import { parseIngredient } from './utils/ingredientParser';
import { trackEvent } from './services/analytics';
import ShoppingList, { ShoppingListItem } from './components/ShoppingList';
import SavedRecipes from './components/SavedRecipes';

import { supabase } from './services/supabaseClient';
import { recipeService } from './services/recipeService';
import { shoppingListService } from './services/shoppingListService';
import { profileService, UserProfile } from './services/profileService';
import ProfileSettings from './components/ProfileSettings';

import { ThemeProvider } from './components/ThemeContext';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
};

const MainContent: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false);
  const [viewingLegal, setViewingLegal] = useState<'none' | 'privacy' | 'terms'>('none');
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>('English');
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);


  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track initial page view
  useEffect(() => {
    trackEvent('page_view');
  }, []);

  // Initialize Supabase Auth Session
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load shopping list from Supabase when session changes
  useEffect(() => {
    if (session?.user) {
      const loadShoppingList = async () => {
        try {
          const list = await shoppingListService.getShoppingList(session.user.id);
          setShoppingList(list);
        } catch (error) {
          console.error("Failed to load shopping list", error);
        }
      };
      loadShoppingList();
    } else {
      setShoppingList([]); // Clear list on logout
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      const loadData = async () => {
        try {
          const [recipes, profile] = await Promise.all([
            recipeService.getSavedRecipes(),
            profileService.getProfile(session.user.id)
          ]);
          setSavedRecipes(recipes);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to load user data", error);
        }
      };
      loadData();
    } else {
      setSavedRecipes([]);
      setUserProfile(null);
    }
  }, [session]);

  const handleSignIn = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  // Helper to update local state; simplified as persistence is now async
  const updateShoppingList = (newList: ShoppingListItem[]) => {
    setShoppingList(newList);
  };

  const handleAddToShoppingList = async (recipe: Recipe) => {
    if (!session?.user) {
      alert("Please sign in to use the shopping list!");
      return;
    }

    if (shoppingList.some(item => item.recipeName === recipe.recipeName)) {
      alert("This recipe is already in your shopping list.");
      return;
    }

    const newItems = recipe.ingredients
      .map(ingredient => parseIngredient(ingredient))
      .filter((item): item is string => item !== null)
      .map(text => ({
        text,
        checked: false,
        recipeName: recipe.recipeName,
      }));

    // Optimistic update
    const newList = [...shoppingList, ...newItems];
    setShoppingList(newList);

    try {
      await shoppingListService.addItems(newItems, session.user.id);
    } catch (e) {
      console.error("Failed to sync shopping list", e);
      // Revert on failure? Or just show error.
      // For simplicity, we keep the UI state but warn
      setError("Failed to save items to shopping list.");
    }
  };

  const handleToggleShoppingListItem = async (itemText: string, recipeName: string) => {
    if (!session?.user) return;

    // Find the item to get new state
    const item = shoppingList.find(i => i.text === itemText && i.recipeName === recipeName);
    if (!item) return;

    const newChecked = !item.checked;

    // Optimistic update
    const newList = shoppingList.map(i =>
      i.text === itemText && i.recipeName === recipeName ? { ...i, checked: newChecked } : i
    );
    setShoppingList(newList);

    try {
      await shoppingListService.toggleItem(itemText, recipeName, newChecked, session.user.id);
    } catch (e) {
      console.error("Failed to toggle item", e);
      // rollback
      setShoppingList(shoppingList);
    }
  };

  const handleClearShoppingList = async () => {
    if (!session?.user) return;

    setShoppingList([]);
    setIsShoppingListOpen(false);

    try {
      await shoppingListService.clearList(session.user.id);
    } catch (e) {
      console.error("Failed to clear list", e);
      setError("Failed to clear shopping list.");
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    if (!session?.user) {
      // You could prompt for login here, or just show an alert
      alert("Please sign in to save recipes!");
      return;
    }

    // Check if already saved
    const exists = savedRecipes.some(r => r.recipeName === recipe.recipeName);

    if (exists) {
      // Toggle off (remove) - we need to find the ID of the recipe to delete it
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
    // Scroll to top to view
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
      // Use the specific error message returned from the service
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
  const uncheckedShoppingListCount = shoppingList.filter(item => !item.checked).length;

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-amber-50 dark:bg-gray-900 text-amber-900 dark:text-gray-100 print:bg-white print:block transition-colors duration-200">
      {/* Header with Logo and Actions */}
      <Header
        cartCount={uncheckedShoppingListCount}
        onOpenCart={() => setIsShoppingListOpen(true)}
        user={session?.user}
        onSignInClick={handleSignIn}
        onSignOutClick={handleSignOut}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <ProfileSettings
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentPrefs={userProfile?.dietary_prefs || []}
        onSave={async (prefs) => {
          if (session?.user) {
            try {
              const updated = await profileService.updateProfile(session.user.id, prefs);
              setUserProfile(updated);
            } catch (e) {
              console.error("Failed to save profile", e);
              setError("Failed to save preferences.");
            }
          } else {
            alert("Please sign in to save preferences.");
          }
        }}
      />

      {isCameraOpen && <CameraView onCapture={handleCameraCapture} onCancel={() => setIsCameraOpen(false)} />}
      {imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      {viewingLegal === 'privacy' && (
        <LegalPage title="Privacy Policy" onDismiss={() => setViewingLegal('none')}>
          <>
            <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
            <p>
              Welcome to Snap-a-Recipe ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
            <h3>1. Information We Collect</h3>
            <p>We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
            <ul>
              <li>
                <strong>User-Generated Content:</strong> We process the images you upload or capture to generate recipes. These images are sent to our AI provider for analysis but are not stored on our servers or associated with any personal information.
              </li>
              <li>
                <strong>Analytics Data:</strong> We may collect anonymous usage data, such as which features are used, to improve our service. This data is not linked to your personal identity.
              </li>
            </ul>
            <h3>2. Use of Your Information</h3>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
            <ul>
              <li>Generate recipes based on the images you provide.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
            </ul>
            <h3>3. Security of Your Information</h3>
            <p>
              We are committed to protecting your data. Since we do not store your images or personal data, the risk of a data breach is minimized. We use secure, encrypted connections (HTTPS) for all data transmissions to our AI service provider.
            </p>
            <h3>4. Third-Party Services</h3>
            <p>This application uses the following third-party services:</p>
            <ul>
              <li><strong>Google Gemini API:</strong> To analyze images and generate recipe content. Your images are sent to Google's servers for processing. Please review Google's Privacy Policy for more information.</li>
            </ul>
            <h3>5. Contact Us</h3>
            <p>If you have questions or comments about this Privacy Policy, please contact us at: [Your Contact Email Here]</p>
          </>
        </LegalPage>
      )}
      {viewingLegal === 'terms' && (
        <LegalPage title="Terms of Service" onDismiss={() => setViewingLegal('none')}>
          <>
            <p><strong>Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
            <p>
              Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Snap-a-Recipe application (the "Service") operated by us.
            </p>
            <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
            <h3>1. User Content</h3>
            <p>
              Our Service allows you to upload images ("User Content"). You retain any and all of your rights to any User Content you submit. By submitting User Content to the Service, you grant us the right and license to use this content solely for the purpose of generating a recipe for you.
            </p>
            <h3>2. Prohibited Uses</h3>
            <p>You agree not to use the Service to upload or generate content that is unlawful, obscene, defamatory, or otherwise objectionable.</p>
            <h3>3. Disclaimer</h3>
            <p>
              The recipes provided by the Service are generated by an AI model and are for informational purposes only. We do not guarantee the accuracy, completeness, or safety of any recipe. You should always use your best judgment, follow safe food handling practices, and consult a professional if you have any dietary restrictions or health concerns.
            </p>
            <h3>4. Termination</h3>
            <p>
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <h3>5. Contact Us</h3>
            <p>If you have any questions about these Terms, please contact us at: [Your Contact Email Here]</p>
          </>
        </LegalPage>
      )}
      <ShoppingList
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        items={shoppingList}
        onToggleItem={(text, name) => handleToggleShoppingListItem(text, name)}
        onClear={handleClearShoppingList}
      />

      <main className="w-full max-w-7xl flex-grow flex flex-col items-center p-4 sm:p-6 md:p-8 pt-4 print:max-w-none print:w-full print:block">

        {/* Hero Title Section */}
        <div className="w-full text-center mb-10 no-print">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-amber-900 dark:text-amber-500 drop-shadow-sm font-serif">
            Snap-a-Recipe
          </h1>
          <p className="mt-2 text-lg sm:text-xl text-amber-700 dark:text-amber-300">
            Turn your food photos into delicious recipes!
          </p>
        </div>

        <div className="w-full flex-grow flex flex-col justify-center items-center">
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

              {/* Saved Recipes List */}
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
                      onAddToShoppingList={handleAddToShoppingList}
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

        <Footer onLinkClick={setViewingLegal} />
      </main>
    </div>
  );
};

export default App;