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
      className={`group shrink-0 inline-flex items-center space-x-2 rounded-full font-sans transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96] cursor-pointer select-none touch-manipulation min-h-[38px] sm:min-h-[36px] backdrop-blur-md ${
        isSm ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'
      } ${
        isActive
          ? 'bg-[var(--champagne)]/15 text-[var(--champagne)] font-medium shadow-[0_4px_20px_-4px_rgba(217,192,138,0.35)] border border-[var(--champagne)]'
          : 'bg-white/[0.03] hover:bg-white/[0.08] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-white/10 hover:border-white/20'
      } ${className}`}
    >
      {icon && (
        <span className={isActive ? 'text-[var(--champagne)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}>
          <CategoryIcon name={icon} size={isSm ? 13 : 15} />
        </span>
      )}
      <span className="truncate">{name}</span>

      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
            isActive
              ? 'bg-[var(--champagne)]/25 text-[var(--champagne)] font-bold'
              : 'bg-white/10 text-[var(--text-muted)]'
          }`}
        >
          {count}
        </span>
      )}

      {avgMargin !== undefined && avgMargin > 0 && (
        <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--emerald)] font-medium">
          +PKR {avgMargin}
        </span>
      )}
    </button>
  );
};
