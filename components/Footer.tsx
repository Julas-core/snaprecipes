import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-4xl text-center mt-8 py-4 no-print">
      <div className="text-xs text-amber-700/80 dark:text-amber-400/80 flex justify-center items-center gap-2">
        <span>© {new Date().getFullYear()} Snap-a-Recipe. All Rights Reserved.</span>
        <span>|</span>
        <Link to="/privacy" className="hover:underline hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
          Privacy Policy
        </Link>
        <span>|</span>
        <Link to="/terms" className="hover:underline hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
          Terms of Service
        </Link>
        <span>|</span>
        <Link to="/faq" className="hover:underline hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
          FAQ
        </Link>
      </div>
    </footer>
  );
};

export default Footer;