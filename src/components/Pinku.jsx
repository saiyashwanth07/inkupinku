import React from "react";

export default function Pinku({ size = 48, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#FCE7F3" />
      {/* Body / Face */}
      <rect x="25" y="35" width="50" height="40" rx="20" fill="#F472B6" />
      {/* Hair / Head Accessory (Bow) */}
      <path d="M40 35 Q50 25 60 35" stroke="#DB2777" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="25" r="5" fill="#DB2777" />
      <ellipse cx="42" cy="28" rx="6" ry="4" transform="rotate(-30 42 28)" fill="#EC4899" />
      <ellipse cx="58" cy="28" rx="6" ry="4" transform="rotate(30 58 28)" fill="#EC4899" />
      
      {/* Eyes */}
      <circle cx="38" cy="48" r="5" fill="white" />
      <circle cx="62" cy="48" r="5" fill="white" />
      {/* Smile */}
      <path d="M42 58 Q50 64 58 58" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Little cheeks */}
      <circle cx="32" cy="54" r="4" fill="#F9A8D4" opacity="0.8" />
      <circle cx="68" cy="54" r="4" fill="#F9A8D4" opacity="0.8" />
    </svg>
  );
}
