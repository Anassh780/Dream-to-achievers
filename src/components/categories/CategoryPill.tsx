import React from 'react';
import { CategoryIcon } from './CategoryIcon';

interface CategoryPillProps {
  name: string;
  icon?: string;
  isActive?: boolean;
  count?: number;
  avgMargin?: number;
  onClick?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  name,
  icon,
  isActive = false,
  count,
  avgMargin,
  onClick,
  size = 'md',
  className = '',
}) => {
  const isSm = size === 'sm';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group shrink-0 inline-flex items-center space-x-2 rounded-full font-sans transition-all duration-200 cursor-pointer select-none ${
        isSm ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
      } ${
        isActive
          ? 'bg-cyan-500/20 text-white font-semibold border border-cyan-400/60 shadow-[0_0_18px_rgba(0,242,254,0.3)] scale-[1.03]'
          : 'bg-[#080E1E]/90 hover:bg-[#0C152B] text-slate-300 hover:text-white border border-white/10 hover:border-white/20'
      } ${className}`}
    >
      {icon && (
        <span className={isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'}>
          <CategoryIcon name={icon} size={isSm ? 13 : 15} weight={isActive ? 'fill' : 'regular'} />
        </span>
      )}
      <span className="truncate">{name}</span>

      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
            isActive
              ? 'bg-cyan-400/30 text-cyan-200 border border-cyan-400/40'
              : 'bg-white/10 text-slate-400 group-hover:text-slate-300'
          }`}
        >
          {count}
        </span>
      )}

      {avgMargin !== undefined && avgMargin > 0 && (
        <span className="hidden sm:inline-block text-[10px] font-mono text-emerald-400 font-medium">
          +PKR {avgMargin}
        </span>
      )}
    </button>
  );
};
