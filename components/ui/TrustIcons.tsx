import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * Premium Quality Lotus Motif Icon
 * Based on authentic Indian lotus emblem in reference design
 */
export function LotusMotifIcon({ size = 36, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer subtle circular petal frame */}
      <circle cx="18" cy="18" r="16" strokeWidth="1.2" strokeDasharray="1 3" opacity="0.6" />
      <circle cx="18" cy="18" r="14.5" strokeWidth="1" opacity="0.4" />
      {/* Central lotus bloom */}
      <path
        d="M18 9C18 12.5 16 16 12 18.5C14.5 21 16 23.5 18 26C20 23.5 21.5 21 24 18.5C20 16 18 12.5 18 9Z"
        strokeWidth="1.3"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Left petal */}
      <path
        d="M18 18.5C14 16 10 17 8 20.5C11 22.5 14.5 22 18 21.5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Right petal */}
      <path
        d="M18 18.5C22 16 26 17 28 20.5C25 22.5 21.5 22 18 21.5"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Lotus base / pedestal */}
      <path
        d="M13 26.5C15 27.5 21 27.5 23 26.5"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Traditional Weaves Loom Motif Icon
 * Handloom shuttle and warp threads
 */
export function LoomWeaveIcon({ size = 36, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Loom frame */}
      <circle cx="18" cy="18" r="16" strokeWidth="1.2" strokeDasharray="1 3" opacity="0.6" />
      <rect x="9" y="10" width="18" height="16" rx="2" strokeWidth="1.3" />
      {/* Warp vertical threads */}
      <line x1="13" y1="10" x2="13" y2="26" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="16" y1="10" x2="16" y2="26" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="19" y1="10" x2="19" y2="26" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="22" y1="10" x2="22" y2="26" strokeWidth="1" strokeDasharray="2 2" />
      {/* Horizontal weaver shuttle thread */}
      <path
        d="M7 18H29"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="18" r="2" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

/**
 * Elegant Designs Diamond Motif Icon
 * Faceted royal jewel
 */
export function DiamondCraftIcon({ size = 36, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="18" cy="18" r="16" strokeWidth="1.2" strokeDasharray="1 3" opacity="0.6" />
      {/* Faceted gemstone */}
      <path
        d="M12 13.5L24 13.5L27.5 18L18 26.5L8.5 18L12 13.5Z"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M8.5 18H27.5" strokeWidth="1" />
      <path d="M14 13.5L16 18L18 26.5" strokeWidth="1" strokeLinejoin="round" />
      <path d="M22 13.5L20 18L18 26.5" strokeWidth="1" strokeLinejoin="round" />
      <path d="M12 13.5L18 18L24 13.5" strokeWidth="0.9" />
    </svg>
  );
}

/**
 * Pan India Delivery Truck Icon
 * Delivery van with luxury ornamental wheels
 */
export function DeliveryTruckIcon({ size = 36, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="18" cy="18" r="16" strokeWidth="1.2" strokeDasharray="1 3" opacity="0.6" />
      {/* Van cabin & cargo body */}
      <path
        d="M8 13.5H20V23H8V13.5Z"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M20 16.5H24.5L27.5 20V23H20V16.5Z"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Wheels */}
      <circle cx="12.5" cy="23.5" r="2.5" strokeWidth="1.3" fill="#FFF8EF" />
      <circle cx="24.5" cy="23.5" r="2.5" strokeWidth="1.3" fill="#FFF8EF" />
      {/* Speed / royal flourish line */}
      <path d="M6 16.5H7.5" strokeWidth="1" strokeLinecap="round" />
      <path d="M5 19H7" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
