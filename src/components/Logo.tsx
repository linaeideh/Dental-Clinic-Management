import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Top Crown (Soft Pink) */}
      <path
        d="M25 40 C 25 15, 45 20, 50 28 C 55 20, 75 15, 75 40"
        stroke="#f472b6" 
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Bottom Roots (Deep Blue) with Loop */}
      <path
        d="M30 55 
           C 30 85, 42 90, 48 75
           C 49 72, 51 72, 52 75
           C 58 90, 70 85, 70 55"
        stroke="#0369a1"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Center Loop Accent */}
      <path
        d="M50 75 V 65"
        stroke="#0369a1"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Middle Wave (Teal/Turquoise) */}
      <path
        d="M15 48 C 35 38, 65 58, 85 48"
        stroke="#2dd4bf"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Logo;