import React, { useEffect, useState, useId } from 'react';
import QRCode from 'qrcode';

export interface RealQrCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  logoUrl?: string;
  logoSize?: number;
  className?: string;
  title?: string;
}

/**
 * High-precision vector SVG QR Code component.
 * Produces 100% mathematically valid, scannable QR codes at any DPI.
 */
export const RealQrCode: React.FC<RealQrCodeProps> = ({
  value,
  size = 128,
  fgColor = '#0F172A',
  bgColor = '#FFFFFF',
  level = 'M',
  margin = 1,
  logoUrl,
  logoSize,
  className = '',
  title,
}) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const componentId = useId().replace(/[^a-zA-Z0-9]/g, '');

  useEffect(() => {
    let isMounted = true;
    const effectiveLevel = logoUrl ? 'H' : level;

    QRCode.toString(value || 'https://dream-to-achievers.vercel.app', {
      type: 'svg',
      width: size,
      margin,
      color: {
        dark: fgColor,
        light: bgColor === 'transparent' ? '#00000000' : bgColor,
      },
      errorCorrectionLevel: effectiveLevel,
    })
      .then((rawSvg) => {
        if (isMounted) {
          // Strip outer <?xml ...?> or DOCTYPE tags if present for inline React rendering
          const cleaned = rawSvg.replace(/<\?xml.*?\?>/gi, '').replace(/<!DOCTYPE.*?>/gi, '');
          setSvgContent(cleaned);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code SVG:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, fgColor, bgColor, level, margin, logoUrl]);

  const computedLogoSize = logoSize || Math.round(size * 0.24);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title={title || `QR Code for ${value}`}
    >
      {svgContent ? (
        <div
          className="w-full h-full [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div
          className="w-full h-full rounded-md flex items-center justify-center animate-pulse"
          style={{ backgroundColor: bgColor === 'transparent' ? 'rgba(255,255,255,0.05)' : bgColor }}
        >
          <div className="w-1/2 h-1/2 border-2 border-dashed rounded opacity-30" style={{ borderColor: fgColor }} />
        </div>
      )}

      {/* Central Brand Logo Overlay (with safety badge ring) */}
      {logoUrl && svgContent && (
        <div
          className="absolute inset-0 m-auto flex items-center justify-center rounded-xl p-1 shadow-md"
          style={{
            width: computedLogoSize,
            height: computedLogoSize,
            backgroundColor: bgColor === 'transparent' ? '#FFFFFF' : bgColor,
          }}
        >
          <img
            src={logoUrl}
            alt="QR Center Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
