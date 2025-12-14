import React from 'react';
import { XIcon } from './icons';

export interface ShoppingListItem {
  text: string;
  checked: boolean;
  recipeName: string;
}

interface ShoppingListProps {
  isOpen: boolean;
  onClose: () => void;
  items: ShoppingListItem[];
  onToggleItem: (itemText: string, recipeName: string) => void;
  onClear: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ isOpen, onClose, items, onToggleItem, onClear }) => {
  if (!isOpen) return null;

  // FIX: Group items by recipe name. Replaced a problematic `reduce` with a simple for-loop
  // to avoid TypeScript inference issues and ensure `groupedItems` is correctly typed.
  const groupedItems: Record<string, ShoppingListItem[]> = {};
  for (const item of items) {
    const key = item.recipeName;
    if (!groupedItems[key]) {
      groupedItems[key] = [];
    }
    groupedItems[key].push(item);
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shopping-list-heading"
    >
      <div
        className="bg-amber-50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full m-4 relative flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-amber-200 flex-shrink-0">
          <h2 id="shopping-list-heading" className="text-3xl font-serif font-bold text-amber-900">Shopping List</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-amber-700 hover:bg-amber-200 transition-colors"
            aria-label="Close shopping list"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 [scrollbar-width:thin] [scrollbar-color:#f59e0b_#fef3c7] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500 hover:[&::-webkit-scrollbar-thumb]:bg-amber-600">
          {items.length === 0 ? (
            <p className="text-center text-amber-700 py-8">Your shopping list is empty. Add ingredients from a recipe!</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([recipeName, recipeItems]) => (
                <div key={recipeName}>
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">{recipeName}</h3>
                  <ul className="space-y-3">
                    {recipeItems.map((item, index) => (
                      <li
                        key={`${item.text}-${index}`}
                        onClick={() => onToggleItem(item.text, item.recipeName)}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleItem(item.text, item.recipeName)}
                        tabIndex={0}
                        role="checkbox"
                        aria-checked={item.checked}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          item.checked ? 'bg-amber-200/50' : 'hover:bg-amber-100/70'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 ${
                          item.checked ? 'bg-amber-600 border-amber-600' : 'border-amber-400'
                        } flex items-center justify-center flex-shrink-0 transition-colors`}>
                          {item.checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`flex-grow transition-all ${
                          item.checked ? 'line-through text-amber-800/60' : 'text-amber-800'
                        }`}>
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="mt-6 pt-4 border-t border-amber-200 flex-shrink-0">
            <button
              onClick={onClear}
              className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingList;