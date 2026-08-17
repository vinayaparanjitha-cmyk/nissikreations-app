import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  customLogoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  customLogoUrl,
}) => {
  if (customLogoUrl && customLogoUrl.trim().length > 0) {
    const sizeClasses = {
      sm: 'h-7 max-w-[140px]',
      md: 'h-10 max-w-[200px]',
      lg: 'h-14 max-w-[280px]',
      xl: 'h-20 max-w-[380px]',
    };

    return (
      <img
        src={customLogoUrl}
        alt="NISSI KREATIONS"
        referrerPolicy="no-referrer"
        className={`object-contain ${sizeClasses[size]} ${className}`}
      />
    );
  }

  // Exact vector rendering matching NISSI KREATIONS brand identity
  const iconDimensions = {
    sm: { width: 140, height: 36, scale: 0.75 },
    md: { width: 180, height: 46, scale: 0.95 },
    lg: { width: 240, height: 60, scale: 1.25 },
    xl: { width: 320, height: 80, scale: 1.65 },
  };

  const current = iconDimensions[size];

  if (!showText) {
    return (
      <svg
        width={36 * current.scale}
        height={36 * current.scale}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="nissiGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
        {/* Left vertical block */}
        <polygon points="6,10 16,4 16,38 6,44" fill="url(#nissiGradIcon)" />
        {/* Right diagonal connector and vertical */}
        <polygon points="20,18 30,12 30,44 20,38" fill="url(#nissiGradIcon)" />
        <polygon points="20,38 30,12 24,12 16,36" fill="url(#nissiGradIcon)" opacity="0.9" />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon */}
      <svg
        width={38 * current.scale}
        height={38 * current.scale}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="nissiRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="nissiRibbon2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
        {/* Stylized N bars */}
        <path
          d="M8 12.5L18 6.5V39.5L8 45.5V12.5Z"
          fill="url(#nissiRibbon1)"
        />
        <path
          d="M22 22L32 16V48L22 42V22Z"
          fill="url(#nissiRibbon2)"
        />
        <polygon points="18,39.5 22,22 32,16 28,16 18,36" fill="#F97316" />
      </svg>

      {/* Brand Name Typography */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center">
          <span
            className="font-black tracking-tight text-slate-900"
            style={{
              fontSize: `${1.3 * current.scale}rem`,
              letterSpacing: '-0.03em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            nıssí
          </span>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 ml-0.5 -mt-2 animate-pulse"
            style={{ width: `${6 * current.scale}px`, height: `${6 * current.scale}px` }}
          />
        </div>
        <span
          className="font-extrabold tracking-wider bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 bg-clip-text text-transparent uppercase"
          style={{
            fontSize: `${0.95 * current.scale}rem`,
            letterSpacing: '0.08em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          kreations
        </span>
      </div>
    </div>
  );
};
