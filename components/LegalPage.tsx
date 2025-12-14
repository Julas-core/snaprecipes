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
        className="bg-amber-50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-3xl w-full m-4 relative flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-amber-200 flex-shrink-0">
          <h2 id="legal-heading" className="text-3xl font-serif font-bold text-amber-900">{title}</h2>
          <button
            onClick={onDismiss}
            className="p-1 rounded-full text-amber-700 hover:bg-amber-200 transition-colors"
            aria-label={`Close ${title}`}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="legal-content overflow-y-auto pr-4 [scrollbar-width:thin] [scrollbar-color:#f59e0b_#fef3c7] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-amber-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-500 hover:[&::-webkit-scrollbar-thumb]:bg-amber-600">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
