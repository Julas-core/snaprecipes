import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import { shoppingListService } from './services/shoppingListService';
import { profileService, UserProfile } from './services/profileService';
import { parseIngredient } from './utils/ingredientParser';
import { ThemeProvider } from './components/ThemeContext';
import { Recipe } from './types';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ShoppingList, { ShoppingListItem } from './components/ShoppingList';
import ProfileSettings from './components/ProfileSettings';

// Pages
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppLayout />
      </Router>
    </ThemeProvider>
  );
};

const AppLayout: React.FC = () => {
  // Global State
  const [session, setSession] = useState<any>(null);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // UI State
  const [isShoppingListOpen, setIsShoppingListOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  // Load shopping list & profile when session changes
  useEffect(() => {
    if (session?.user) {
      const loadData = async () => {
        try {
          const [list, profile] = await Promise.all([
            shoppingListService.getShoppingList(session.user.id),
            profileService.getProfile(session.user.id)
          ]);
          setShoppingList(list);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to load user data", error);
        }
      };
      loadData();
    } else {
      setShoppingList([]);
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
    setIsShoppingListOpen(true); // Auto-open cart to show added items

    try {
      await shoppingListService.addItems(newItems, session.user.id);
    } catch (e) {
      console.error("Failed to sync shopping list", e);
      // Revert interaction if critical, but for now just log
    }
  };

  const handleToggleShoppingListItem = async (itemText: string, recipeName: string) => {
    if (!session?.user) return;

    const item = shoppingList.find(i => i.text === itemText && i.recipeName === recipeName);
    if (!item) return;

    const newChecked = !item.checked;
    const newList = shoppingList.map(i =>
      i.text === itemText && i.recipeName === recipeName ? { ...i, checked: newChecked } : i
    );
    setShoppingList(newList);

    try {
      await shoppingListService.toggleItem(itemText, recipeName, newChecked, session.user.id);
    } catch (e) {
      console.error("Failed to toggle item", e);
      setShoppingList(shoppingList); // Revert
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
    }
  };

  const uncheckedShoppingListCount = shoppingList.filter(item => !item.checked).length;

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-amber-50 dark:bg-gray-900 text-amber-900 dark:text-gray-100 print:bg-white print:block transition-colors duration-200">

      {/* Global Header */}
      <Header
        cartCount={uncheckedShoppingListCount}
        onOpenCart={() => setIsShoppingListOpen(true)}
        user={session?.user}
        onSignInClick={handleSignIn}
        onSignOutClick={handleSignOut}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Global Modals */}
      <ShoppingList
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        items={shoppingList}
        onToggleItem={handleToggleShoppingListItem}
        onClear={handleClearShoppingList}
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
            }
          }
        }}
      />

      {/* Main Routing Content */}
      <main className="w-full max-w-7xl flex-grow flex flex-col items-center p-4 sm:p-6 md:p-8 pt-4 print:max-w-none print:w-full print:block">
        <Routes>
          <Route path="/" element={
            <Home
              session={session}
              userProfile={userProfile}
              shoppingList={shoppingList}
              onAddToShoppingList={handleAddToShoppingList}
            />
          } />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>

        <Footer />
      </main>

    </div>
  );
};

export default App;