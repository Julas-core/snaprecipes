import React from 'react';
import { XIcon } from './icons';

interface LegalPageProps {
  title: string;
  onDismiss: () => void;
  children: React.ReactNode;
}

const LegalPage: React.FC<LegalPageProps> = ({ title, onDismiss, children }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center animate-fade-in p-4"
      onClick={onDismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-heading"
    >
      <div
        className="bg-amber-50 dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-3xl w-full m-4 relative flex flex-col max-h-[85vh] transition-colors"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-amber-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="legal-heading" className="text-3xl font-serif font-bold text-amber-900 dark:text-amber-100">{title}</h2>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={`Close ${title}`}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="legal-content overflow-y-auto pr-4 [scrollbar-width:thin] [scrollbar-color:#f59e0b_#fef3c7] dark:[scrollbar-color:#d97706_#374151] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-100 dark:[&::-webkit-scrollbar-track]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500 dark:[&::-webkit-scrollbar-thumb]:bg-amber-700 hover:[&::-webkit-scrollbar-thumb]:bg-amber-600 dark:text-amber-100 [&_h3]:text-amber-900 dark:[&_h3]:text-amber-200 [&_strong]:text-amber-900 dark:[&_strong]:text-amber-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
