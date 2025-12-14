import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-amber-800">
      <div className="relative w-24 h-24 mb-4">
        {/* Steam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          <span className="absolute left-[30%] top-[10%] h-4 w-1 bg-amber-400/60 rounded-full animate-steam" style={{ animationDelay: '0s' }}></span>
          <span className="absolute left-[50%] top-[5%] h-6 w-1 bg-amber-400/60 rounded-full animate-steam" style={{ animationDelay: '0.5s' }}></span>
          <span className="absolute left-[70%] top-[12%] h-3 w-1 bg-amber-400/60 rounded-full animate-steam" style={{ animationDelay: '0.2s' }}></span>
        </div>
        {/* Bowl */}
        <svg
          className="w-full h-full text-amber-700"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          fill="none"
        >
          <path
            d="M5 50 C5 75, 25 95, 50 95 C75 95, 95 75, 95 50"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <p className="text-xl font-semibold font-serif tracking-wide">Brewing up your recipe...</p>
    </div>
  );
};

export default LoadingSpinner;