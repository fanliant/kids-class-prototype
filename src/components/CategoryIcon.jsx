import React from 'react';

// 簡單的線條圖示,對應三種品類,純CSS/SVG,不依賴外部圖片
export default function CategoryIcon({ type, size = 36 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'white', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (type === 'piano') {
    return (
      <svg {...common} className="card-media-icon">
        <rect x="3" y="8" width="18" height="9" rx="1" />
        <line x1="7" y1="8" x2="7" y2="14" />
        <line x1="10.5" y1="8" x2="10.5" y2="14" />
        <line x1="14" y1="8" x2="14" y2="14" />
        <line x1="17.5" y1="8" x2="17.5" y2="14" />
      </svg>
    );
  }
  if (type === 'swim') {
    return (
      <svg {...common} className="card-media-icon">
        <path d="M2 16c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
        <path d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" />
        <circle cx="17" cy="6" r="1.6" />
      </svg>
    );
  }
  // chinese
  return (
    <svg {...common} className="card-media-icon">
      <line x1="6" y1="4" x2="6" y2="20" />
      <line x1="3" y1="9" x2="9" y2="9" />
      <line x1="4" y1="14" x2="8" y2="18" />
      <line x1="8" y1="14" x2="4" y2="18" />
      <path d="M14 6h7" />
      <path d="M16 4v3c0 4-1 8-4 11" />
      <path d="M19 4v3c0 5 1 8 3 11" />
    </svg>
  );
}
