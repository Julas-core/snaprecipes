
import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface ProfileSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentPrefs: string[];
    onSave: (prefs: string[]) => void;
}

const DIETARY_OPTIONS = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Nut-Free",
    "Low-Carb",
    "Keto",
    "Paleo",
    "Halal",
    "Kosher"
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose, currentPrefs, onSave }) => {
    const [selectedPrefs, setSelectedPrefs] = useState<Set<string>>(new Set(currentPrefs));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSelectedPrefs(new Set(currentPrefs));
    }, [currentPrefs, isOpen]);

    if (!isOpen) return null;

    const togglePref = (pref: string) => {
        setSelectedPrefs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pref)) {
                newSet.delete(pref);
            } else {
                newSet.add(pref);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(Array.from(selectedPrefs));
        setIsSaving(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-amber-50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full m-4 relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-amber-900">Dietary Preferences</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-amber-700 hover:bg-amber-200 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <p className="text-amber-800 mb-6 text-sm">
                    Select any dietary restrictions or preferences. We'll tailor your generated recipes to match!
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {DIETARY_OPTIONS.map(pref => (
                        <button
                            key={pref}
                            onClick={() => togglePref(pref)}
                            className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${selectedPrefs.has(pref)
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                                    : 'bg-white border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50'
                                }`}
                        >
                            {pref}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-amber-800 font-semibold hover:bg-amber-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-amber-800 text-white font-semibold rounded-lg shadow hover:bg-amber-900 transition-all disabled:opacity-70"
                    >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
