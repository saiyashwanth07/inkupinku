import React from "react";

export default function Inku({ size = 48, className = "" }) {
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
      <circle cx="50" cy="50" r="48" fill="#E0F2FE" />
      {/* Body / Face */}
      <rect x="25" y="30" width="50" height="45" rx="16" fill="#60A5FA" />
      {/* Antenna */}
      <path d="M50 30 V15" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
      <circle cx="50" cy="12" r="4" fill="#2563EB" />
      {/* Eyes */}
      <circle cx="38" cy="45" r="5" fill="white" />
      <circle cx="62" cy="45" r="5" fill="white" />
      {/* Smile */}
      <path d="M40 58 Q50 65 60 58" stroke="white" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Little cheeks */}
      <circle cx="32" cy="52" r="3" fill="#93C5FD" opacity="0.8" />
      <circle cx="68" cy="52" r="3" fill="#93C5FD" opacity="0.8" />
    </svg>
  );
}
