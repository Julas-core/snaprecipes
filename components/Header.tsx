import React from 'react';
import { ShoppingCartIcon } from './icons';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  user: any | null;
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, onOpenCart, user, onSignInClick, onSignOutClick }) => {
  return (
    <header className="w-full bg-white/80  shadow-sm sticky top-0 z-40 border-b border-amber-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center">
          <img src="Snap a Recipe (Logo) ver-2.svg" alt="Snap-a-Recipe" className="h-12 w-auto object-contain" />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center justify-center h-10 w-10 bg-amber-50 text-amber-800 rounded-full hover:bg-amber-100 transition border border-amber-200"
            aria-label="Open shopping list"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Google Sign In / User Profile */}
          {!user ? (
            <button
              onClick={onSignInClick}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
                <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853" />
                <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
                <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335" />
              </svg>
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign in</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name}
                  className="w-8 h-8 rounded-full border border-amber-200"
                />
              )}
              <button
                onClick={onSignOutClick}
                className="text-sm text-amber-700 hover:text-amber-900 font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;