import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  onDark?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: { mark: 28, text: '1rem', radius: 8, font: 10 },
  md: { mark: 34, text: '1.15rem', radius: 10, font: 12 },
  lg: { mark: 44, text: '1.35rem', radius: 12, font: 15 },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  to = '/',
  size = 'md',
  showWordmark = true,
  onDark = false,
  className = '',
  onClick,
}) => {
  const s = sizeMap[size];
  return (
    <Link
      to={to}
      className={`pg-brand-logo ${onDark ? 'on-dark' : ''} ${className}`.trim()}
      aria-label="PinGuru home"
      onClick={onClick}
    >
      <span
        className="pg-brand-mark"
        style={{
          width: s.mark,
          height: s.mark,
          borderRadius: s.radius,
          fontSize: s.font,
        }}
      >
        PG
      </span>
      {showWordmark && (
        <span className="pg-brand-wordmark" style={{ fontSize: s.text }}>
          PinGuru
        </span>
      )}
    </Link>
  );
};
