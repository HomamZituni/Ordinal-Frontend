import React from 'react';

export default function GamificationBanner({ message = '', progressPercent = 0 }) {
  return (
    <div
      style={{
        background: '#243447',
        borderRadius: 12,
        padding: 24,
        marginBottom: 32,
        border: '1px solid #374151',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <p
        style={{
          color: '#D1D5DB',
          margin: '0 0 12px 0',
          fontSize: 15,
        }}
      >
        {message}
      </p>
      <div
        style={{
          width: '100%',
          height: 12,
          background: '#1F2A3A',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Number(progressPercent) || 0}%`,
            height: '100%',
            background: '#C9A84E',
            borderRadius: 6,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}