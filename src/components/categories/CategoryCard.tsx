import React from 'react';
import { Category } from '@/types';
import { CategoryIcon } from './CategoryIcon';
import { Sparkle, Package, TrendUp, ShieldCheck } from '@phosphor-icons/react';

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, className = '' }) => {
  return (
    <div
      className={`rounded-3xl bg-[#060B18] border border-white/[0.08] overflow-hidden shadow-xl hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      {/* Banner / Visual Top */}
      <div className="relative aspect-[16/8] bg-[#030712] overflow-hidden">
        {category.bannerUrl || category.thumbnailUrl ? (
          <img
            src={category.bannerUrl || category.thumbnailUrl}
            alt={category.name}
            className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-cyan-950/30 to-blue-950/20">
            <CategoryIcon name={category.icon} size={36} className="text-cyan-400/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#060B18] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#030712]/80 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            Tier {category.depth + 1} • {category.depth === 0 ? 'Top-Level' : category.depth === 1 ? 'Sub-Category' : 'Leaf Category'}
          </span>
          {category.featured && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
              <Sparkle size={10} weight="fill" />
              <span>FEATURED</span>
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <CategoryIcon name={category.icon} size={16} />
            </div>
            <h3 className="font-heading font-bold text-base text-white tracking-tight">
              {category.name}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {category.description || 'Verified wholesale catalog category with instant margin tracking.'}
          </p>
        </div>

        {/* Live Category Economics Bar */}
        <div className="p-3 rounded-2xl bg-[#030712] border border-white/[0.06] grid grid-cols-2 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-mono">Available Stock</span>
            <span className="text-white font-bold font-jetbrains flex items-center justify-center space-x-1">
              <Package size={13} className="text-cyan-400" />
              <span>{category.productCount ?? 0} SKUs</span>
            </span>
          </div>
          <div className="border-l border-white/[0.06]">
            <span className="text-[10px] text-slate-400 block font-mono">Avg Partner Profit</span>
            <span className="text-emerald-400 font-bold font-jetbrains flex items-center justify-center space-x-1">
              <TrendUp size={13} />
              <span>+PKR {category.avgProfitMarginPKR ?? 500}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
