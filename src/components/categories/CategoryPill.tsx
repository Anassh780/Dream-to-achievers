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
      className={`group shrink-0 inline-flex items-center space-x-2 rounded-full font-sans transition-all duration-150 cursor-pointer select-none ${
        isSm ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'
      } ${
        isActive
          ? 'bg-[#1F4D3E] text-white font-medium shadow-xs border border-[#1F4D3E]'
          : 'bg-white hover:bg-[#FAF7EF] text-[#5B5C50] hover:text-[#1E241F] border border-[#E3DCC8]'
      } ${className}`}
    >
      {icon && (
        <span className={isActive ? 'text-white' : 'text-[#7C7D70]'}>
          <CategoryIcon name={icon} size={isSm ? 13 : 15} />
        </span>
      )}
      <span className="truncate">{name}</span>

      {count !== undefined && count > 0 && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            isActive
              ? 'bg-white/20 text-white'
              : 'bg-[#F1ECDD] text-[#5B5C50]'
          }`}
        >
          {count}
        </span>
      )}

      {avgMargin !== undefined && avgMargin > 0 && (
        <span className="hidden sm:inline-block text-[10px] font-mono text-[#B8862E] font-medium">
          +PKR {avgMargin}
        </span>
      )}
    </button>
  );
};
