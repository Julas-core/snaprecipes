import React from 'react';

interface FooterProps {
  onLinkClick: (page: 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  return (
    <footer className="w-full max-w-4xl text-center mt-8 py-4 no-print">
      <div className="text-xs text-amber-700/80">
        <span>© {new Date().getFullYear()} Snap-a-Recipe. All Rights Reserved.</span>
        <span className="mx-2">|</span>
        <button onClick={() => onLinkClick('privacy')} className="hover:underline hover:text-amber-800 transition-colors">
          Privacy Policy
        </button>
        <span className="mx-2">|</span>
        <button onClick={() => onLinkClick('terms')} className="hover:underline hover:text-amber-800 transition-colors">
          Terms of Service
        </button>
      </div>
    </footer>
  );
};

export default Footer;