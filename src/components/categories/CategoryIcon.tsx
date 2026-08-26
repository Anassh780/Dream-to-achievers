import React from 'react';
import {
  Sparkle,
  Cpu,
  Package,
  Heart,
  Flame,
  Trophy,
  SpeakerHigh,
  Watch,
  Gift,
  TreeStructure,
  Tag,
  ShoppingBag,
  Eye,
  Star,
  Scales,
  Crown,
  Lightning,
  Palette,
  ShieldCheck,
} from '@phosphor-icons/react';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkle,
  Cpu,
  Package,
  Heart,
  Flame,
  Trophy,
  SpeakerHigh,
  Watch,
  Gift,
  TreeStructure,
  Tag,
  ShoppingBag,
  Eye,
  Star,
  Scales,
  Crown,
  Lightning,
  Palette,
  ShieldCheck,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface CategoryIconProps {
  name?: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name = 'Package',
  size = 16,
  weight = 'regular',
  className = '',
}) => {
  const IconComponent = ICON_MAP[name] || Package;
  return <IconComponent size={size} weight={weight} className={className} />;
};
