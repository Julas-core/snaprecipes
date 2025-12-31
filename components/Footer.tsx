import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/Julas-core/snaprecipes'
  return (
    <footer className="w-full max-w-4xl text-center mt-8 py-4 no-print">
      <div className="text-xs text-amber-700/80 dark:text-amber-400/80 flex justify-center items-center gap-2">
        {/* <span>|</span> */}
        <Link to="/privacy" className="hover:underline hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
          Privacy Policy
        </Link>
        <span>|</span>
        <Link to="/terms" className="hover:underline hover:text-amber-800 dark:hover:text-amber-200 transition-colors">
          Terms of Service
        </Link>
        <span>|</span>
        <Link to="/faq" className="hover:underline hover:text-amber-800 dark:hover:text-amber-200 transition-colors" title="FAQ's">
          FAQ's
        </Link>
        <span>|</span>
        <a href={githubUrl} 
           target="_blank"
           rel="noopener noreferrer"
           className="hover:underline hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
           title="Github"
           >
            Github
        </a><br />
      </div>
        <span className="text-xs text-amber-700/80 dark:text-amber-400/80 flex justify-center items-center gap-2">
        © {new Date().getFullYear()} Snap-a-Recipe. All Rights Reserved.
        </span>
    </footer>
  );
};

export default Footer;