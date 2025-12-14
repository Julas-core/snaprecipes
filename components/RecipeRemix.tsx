import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface RecipeRemixProps {
  onRemix: (prompt: string) => Promise<void>;
  isRemixing: boolean;
}

const suggestionPrompts = [
    "Make it vegan",
    "Make it gluten-free",
    "Double the servings",
    "Make it healthier",
    "Add a spicy kick",
];

const RecipeRemix: React.FC<RecipeRemixProps> = ({ onRemix, isRemixing }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (prompt.trim() && !isRemixing) {
            onRemix(prompt.trim());
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        setPrompt(suggestion);
        if (!isRemixing) {
            onRemix(suggestion);
        }
    }

    return (
        <div className="mt-8 p-6 bg-amber-100/50 rounded-xl border border-amber-200">
            <h3 className="text-xl font-semibold font-serif text-amber-900 mb-4 text-center">Remix this Recipe</h3>
            <div className="mb-4 flex flex-wrap justify-center gap-2">
                {suggestionPrompts.map((s) => (
                    <button 
                        key={s} 
                        onClick={() => handleSuggestionClick(s)}
                        disabled={isRemixing}
                        className="px-3 py-1 text-sm bg-white border border-amber-300 text-amber-800 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {s}
                    </button>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isRemixing}
                    placeholder="e.g., make it for 2 people"
                    className="flex-grow px-4 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none transition-shadow disabled:bg-amber-100"
                />
                <button 
                    type="submit"
                    disabled={isRemixing || !prompt.trim()}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow-md hover:bg-amber-900 transition-all focus:outline-none focus:ring-2 focus:ring-amber-600 disabled:bg-amber-700 disabled:cursor-not-allowed"
                >
                    {isRemixing ? (
                         <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Remixing...</span>
                        </>
                    ) : (
                         <>
                            <SparklesIcon className="w-5 h-5" />
                            <span>Remix</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default RecipeRemix;
