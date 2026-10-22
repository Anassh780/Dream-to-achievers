import React from 'react';
import { SettlementRecord } from '@/types/settlement';

export interface BackgroundPresetOption {
  id: string;
  name: string;
  category: 'Modern Tech' | 'Luxury Metallic' | 'Clean Executive';
  previewGradient: string;
  description: string;
}

export const BACKGROUND_PRESETS: BackgroundPresetOption[] = [
  {
    id: 'default',
    name: 'Template Original',
    category: 'Modern Tech',
    previewGradient: 'linear-gradient(135deg, #1E293B, #0F172A)',
    description: 'Original native template background styling',
  },
  {
    id: 'holographic_blue',
    name: 'Holographic Electric Blue',
    category: 'Modern Tech',
    previewGradient: 'linear-gradient(135deg, #38BDF8 0%, #2563EB 50%, #1D4ED8 100%)',
    description: 'Flagship Funding Pips iridescent blue with cyber grid perspective',
  },
  {
    id: 'emerald_cyber',
    name: 'Cyberpunk Emerald Matrix',
    category: 'Modern Tech',
    previewGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #059669 100%)',
    description: 'High-tech neon emerald clearing node with cybernetic grid',
  },
  {
    id: 'imperial_gold',
    name: 'Imperial 24K Obsidian Gold',
    category: 'Luxury Metallic',
    previewGradient: 'linear-gradient(135deg, #07090E 0%, #1A160E 50%, #D4AF37 100%)',
    description: 'Prestige VIP deep black obsidian with brushed metallic gold aura',
  },
  {
    id: 'midnight_sapphire',
    name: 'Midnight Sapphire Nebula',
    category: 'Modern Tech',
    previewGradient: 'linear-gradient(135deg, #030712 0%, #0c1938 50%, #1e3a8a 100%)',
    description: 'Deep cosmic blue with luminous sapphire backlighting',
  },
  {
    id: 'titanium_carbon',
    name: 'Stealth Titanium Carbon',
    category: 'Modern Tech',
    previewGradient: 'linear-gradient(135deg, #0B0E14 0%, #1E293B 50%, #334155 100%)',
    description: 'Precision aerospace slate with brushed titanium accents',
  },
  {
    id: 'pearl_white',
    name: 'Pearl Studio Executive',
    category: 'Clean Executive',
    previewGradient: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 50%, #E2E8F0 100%)',
    description: 'Crisp corporate ivory with silver wireframe framing',
  },
  {
    id: 'custom',
    name: 'Custom Admin Artwork',
    category: 'Modern Tech',
    previewGradient: 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)',
    description: 'Custom gradient or user-uploaded background image',
  },
];

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'Modern Sans' | 'Display Grotesk' | 'Tech Mono' | 'Luxury Serif';
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'plus_jakarta',
    name: 'Plus Jakarta Sans (Modern Fintech Standard)',
    family: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    category: 'Modern Sans',
  },
  {
    id: 'inter',
    name: 'Inter (Precision Clean UI)',
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    category: 'Modern Sans',
  },
  {
    id: 'outfit',
    name: 'Outfit (High-Impact Geometric Display)',
    family: "'Outfit', 'Plus Jakarta Sans', sans-serif",
    category: 'Display Grotesk',
  },
  {
    id: 'space_grotesk',
    name: 'Space Grotesk (Cyber Tech & Prop Trading)',
    family: "'Space Grotesk', sans-serif",
    category: 'Display Grotesk',
  },
  {
    id: 'jetbrains_mono',
    name: 'JetBrains Mono (Cryptographic Terminal)',
    family: "'JetBrains Mono', monospace",
    category: 'Tech Mono',
  },
  {
    id: 'cinzel',
    name: 'Cinzel (Imperial Roman Sovereign)',
    family: "'Cinzel', Georgia, serif",
    category: 'Luxury Serif',
  },
  {
    id: 'playfair',
    name: 'Playfair Display (Executive Editorial)',
    family: "'Playfair Display', Georgia, serif",
    category: 'Luxury Serif',
  },
];

/**
 * Computes custom dynamic background CSS based on record presets or custom values.
 */
export function resolveSettlementBackground(
  record: SettlementRecord,
  fallbackBackground?: string
): React.CSSProperties {
  const preset = record.backgroundPreset || 'default';

  if (preset === 'custom') {
    if (record.customBackgroundImageUrl) {
      return {
        backgroundImage: `url(${record.customBackgroundImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (record.customBackgroundGradient) {
      return {
        background: record.customBackgroundGradient,
      };
    }
  }

  switch (preset) {
    case 'holographic_blue':
      return {
        background: `
          radial-gradient(circle at 100% 70%, rgba(56, 189, 248, 0.95) 0%, rgba(37, 99, 235, 0.92) 40%, rgba(29, 78, 216, 0.85) 75%, transparent 90%),
          radial-gradient(circle at 15% 90%, rgba(147, 197, 253, 0.6) 0%, transparent 50%),
          linear-gradient(180deg, #FFFFFF 0%, #F0F7FF 38%, #DBEAFE 100%)
        `,
      };
    case 'emerald_cyber':
      return {
        backgroundColor: '#030D09',
        backgroundImage: `
          radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.22) 0%, transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
          radial-gradient(circle at 0% 100%, rgba(52, 211, 153, 0.12) 0%, transparent 45%),
          linear-gradient(to right, rgba(52, 211, 153, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(52, 211, 153, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 28px 28px, 28px 28px',
      };
    case 'imperial_gold':
      return {
        backgroundColor: '#07090E',
        backgroundImage: `
          radial-gradient(ellipse at 50% -10%, rgba(245, 158, 11, 0.28) 0%, transparent 60%),
          radial-gradient(circle at 95% 90%, rgba(212, 175, 55, 0.12) 0%, transparent 45%),
          radial-gradient(circle at 5% 90%, rgba(251, 191, 36, 0.08) 0%, transparent 45%),
          linear-gradient(to right, rgba(245, 158, 11, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(245, 158, 11, 0.04) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 32px 32px, 32px 32px',
      };
    case 'midnight_sapphire':
      return {
        backgroundColor: '#040714',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.25) 0%, transparent 65%),
          radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.18) 0%, transparent 50%),
          radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.15) 0%, transparent 45%),
          linear-gradient(to right, rgba(96, 165, 250, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(96, 165, 250, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 100% 100%, 30px 30px, 30px 30px',
      };
    case 'titanium_carbon':
      return {
        backgroundColor: '#090D14',
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(148, 163, 184, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.06) 0%, transparent 40%),
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 24px 24px, 24px 24px',
      };
    case 'pearl_white':
      return {
        backgroundColor: '#FFFFFF',
        backgroundImage: `
          radial-gradient(circle at 100% 0%, rgba(226, 232, 240, 0.8) 0%, transparent 50%),
          radial-gradient(circle at 0% 100%, rgba(241, 245, 249, 0.9) 0%, transparent 50%),
          linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 100% 100%, 32px 32px, 32px 32px',
      };
    case 'default':
    default:
      return fallbackBackground ? { background: fallbackBackground } : {};
  }
}
