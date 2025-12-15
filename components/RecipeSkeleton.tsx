import React from 'react';

const RecipeSkeleton = () => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-black/30 p-6 md:p-8 w-full animate-fade-in animate-pulse">
      {/* Title */}
      <div className="h-8 bg-gray-200 rounded-md w-3/4 mx-auto mb-4"></div>

      {/* Description */}
      <div className="space-y-2 max-w-3xl mx-auto mb-8">
        <div className="h-4 bg-gray-200 rounded-md w-full"></div>
        <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8 border-t border-b border-amber-200 py-4">
        <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
        <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg"></div>
        <div className="h-9 w-36 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Tabs */}
      <div className="border-b border-amber-300 mb-6">
        <div className="flex justify-center space-x-2 md:space-x-6 -mb-px">
          <div className="py-3 px-4 w-40">
            <div className="h-6 bg-gray-200 rounded-md"></div>
          </div>
          <div className="py-3 px-4 w-48">
            <div className="h-6 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Content Skeleton (Ingredients List) */}
      <div className="space-y-4 mt-6">
        {Array(6).fill(0).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <div className="w-6 h-6 rounded-md bg-gray-200 flex-shrink-0"></div>
            <div className="h-5 bg-gray-200 rounded-md flex-grow"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeSkeleton;