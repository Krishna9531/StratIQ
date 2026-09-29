import React from 'react';

export function DecisionCoreLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Converging Path 1 (Top) */}
      <path d="M4 6H12C15.866 6 19 9.13401 19 13C19 14.5215 18.5147 15.9294 17.6908 17.073" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Converging Path 2 (Bottom) */}
      <path d="M4 18H10C11.9678 18 13.729 17.1147 14.927 15.707" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Decision Node (Negative space anchor) */}
      <circle cx="5.5" cy="12" r="1.5" fill="currentColor" />
      
      {/* The vertical stem of the D */}
      <path d="M4 6V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
