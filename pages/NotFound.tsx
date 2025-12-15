
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-9xl font-serif font-bold text-amber-200 mb-4 select-none">404</h1>
            <h2 className="text-3xl font-serif font-bold text-amber-900 mb-6">Page Not Found</h2>
            <p className="text-amber-800 mb-8 max-w-md">
                The recipe you are looking for seems to have gotten lost in the kitchen.
            </p>
            <Link
                to="/"
                className="px-8 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;
