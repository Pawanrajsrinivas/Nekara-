import React from "react";

interface IndianOrnamentProps {
  className?: string;
  size?: number;
}

export function IndianOrnament({ className, size = 26 }: IndianOrnamentProps) {
  return (
    <svg
      width={size * 1.8}
      height={size}
      viewBox="0 0 54 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Central diamond / lotus medallion */}
      <path
        d="M27 3L32 15L27 27L22 15L27 3Z"
        fill="#B58A45"
        fillOpacity="0.25"
        stroke="#B58A45"
        strokeWidth="1.2"
      />
      <circle cx="27" cy="15" r="2.5" fill="#B58A45" />

      {/* Flanking ornate leaves / scrolls */}
      <path
        d="M22 15C16 11 11 12 7 15C11 18 16 19 22 15Z"
        stroke="#B58A45"
        strokeWidth="1"
        fill="#B58A45"
        fillOpacity="0.1"
      />
      <path
        d="M32 15C38 11 43 12 47 15C43 18 38 19 32 15Z"
        stroke="#B58A45"
        strokeWidth="1"
        fill="#B58A45"
        fillOpacity="0.1"
      />

      {/* Tiny outer accent dots */}
      <circle cx="4" cy="15" r="1.5" fill="#B58A45" />
      <circle cx="50" cy="15" r="1.5" fill="#B58A45" />
    </svg>
  );
}
