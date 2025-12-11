import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top Crown (Peach/Pink) */}
      <path
        d="M25 40 C25 18 40 25 50 32 C60 25 75 18 75 40"
        stroke="#fca5a5"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Middle Wave (Teal) */}
      <path
        d="M15 48 C35 40 55 58 85 45"
        stroke="#5eead4"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Bottom Roots (Dark Blue) */}
      <path
        d="M30 55 C30 90 45 90 48 70 C49 62 51 62 52 70 C55 90 70 90 70 55"
        stroke="#0369a1" 
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo;