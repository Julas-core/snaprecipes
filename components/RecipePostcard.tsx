import React from 'react';
import { Recipe } from '../types';
import { XIcon, DownloadIcon } from './icons';

interface RecipePostcardProps {
    recipe: Recipe;
    isOpen: boolean;
    onClose: () => void;
}

const vibeThemes: Record<string, {
    bg: string;
    accent: string;
    font: string;
    border: string;
    stamp: string;
}> = {
    Rustic: {
        bg: 'bg-[#fdf6e3]', // Warm paper
        accent: 'text-amber-900',
        font: 'font-serif',
        border: 'border-amber-200',
        stamp: 'bg-amber-800 text-amber-50'
    },
    Elegant: {
        bg: 'bg-zinc-50',
        accent: 'text-zinc-900',
        font: 'font-serif tracking-widest',
        border: 'border-zinc-300',
        stamp: 'bg-black text-white'
    },
    Fiery: {
        bg: 'bg-orange-50',
        accent: 'text-orange-950',
        font: 'font-serif italic',
        border: 'border-orange-200',
        stamp: 'bg-red-800 text-red-50'
    },
    Fresh: {
        bg: 'bg-emerald-50',
        accent: 'text-emerald-950',
        font: 'font-sans font-light',
        border: 'border-emerald-200',
        stamp: 'bg-emerald-800 text-emerald-50'
    },
    Modern: {
        bg: 'bg-slate-50',
        accent: 'text-slate-900',
        font: 'font-sans font-bold',
        border: 'border-slate-300',
        stamp: 'bg-blue-900 text-blue-50'
    }
};

const RecipePostcard: React.FC<RecipePostcardProps> = ({ recipe, isOpen, onClose }) => {
    if (!isOpen) return null;

    const vibe = recipe.chefVibe || 'Rustic';
    const theme = vibeThemes[vibe] || vibeThemes.Rustic;

    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
                <XIcon className="w-8 h-8" />
            </button>

            <div className="max-w-md w-full animate-scale-up">
                {/* The "Postcard" Container */}
                <div id="recipe-postcard" className={`${theme.bg} p-6 shadow-2xl rounded-sm transform hover:rotate-1 transition-transform duration-500 relative overflow-hidden`}>

                    {/* Artistic Watermark Background */}
                    <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 pointer-events-none">
                        <span className="text-9xl font-black">RECIPE</span>
                    </div>

                    {/* Image Area (Polaroid style) */}
                    <div className="bg-white p-3 pb-12 shadow-md border border-gray-100 mb-6">
                        {recipe.imageUrl ? (
                            <img
                                src={recipe.imageUrl}
                                alt={recipe.recipeName}
                                className="w-full aspect-square object-cover grayscale-[0.2] contrast-[1.1]"
                            />
                        ) : (
                            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400 italic">
                                Image captured via Snap-a-Recipe
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="text-center px-4">
                        <h3 className={`${theme.font} ${theme.accent} text-3xl mb-1`}>
                            {recipe.premiumName || recipe.recipeName}
                        </h3>
                        <div className={`w-12 h-0.5 mx-auto mb-4 ${theme.accent.replace('text-', 'bg-')} opacity-30`}></div>

                        <p className={`${theme.accent} opacity-80 text-sm leading-relaxed mb-8 italic`}>
                            "{recipe.description.split('.')[0]}."
                        </p>

                        <div className="flex justify-between items-end border-t pt-6 mt-8 opacity-60">
                            <div className="text-left">
                                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme.accent}`}>Cuisine Style</span>
                                <p className={`text-sm ${theme.font} ${theme.accent}`}>{vibe}</p>
                            </div>

                            {/* App Branding "Stamp" */}
                            <div className={`${theme.stamp} px-3 py-1 text-[10px] font-black tracking-tighter rounded-sm rotate-2 flex items-center gap-1 shadow-sm`}>
                                <span className="uppercase">Try generating a recipe with </span>
                                <span><a href="https://snaparecipe.vercel.app">Snap-a-Recipe</a></span>
                            </div>
                            
                        </div>
                    </div>
                </div>

                {/* Info Text Below */}
                <p className="text-white/60 text-center mt-6 text-sm flex items-center justify-center gap-2">
                    Tip: Take a screenshot to share with friends!
                </p>
            </div>
        </div>
    );
};

export default RecipePostcard;
