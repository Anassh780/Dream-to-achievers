import React from 'react';
import { Category, CategoryTreeNode } from '@/types';
import { CategoryPill } from './CategoryPill';
import { Sparkle, CaretRight } from '@phosphor-icons/react';

interface CategoryPillCarouselProps {
  categoryTree: CategoryTreeNode[];
  selectedCategorySlug: string | null;
  selectedSubSlug: string | null;
  onSelectCategory: (slug: string | null, subSlug?: string | null) => void;
  allProductsCount?: number;
}

export const CategoryPillCarousel: React.FC<CategoryPillCarouselProps> = ({
  categoryTree,
  selectedCategorySlug,
  selectedSubSlug,
  onSelectCategory,
  allProductsCount,
}) => {
  // Find current top-level selected node
  const activeNode = categoryTree.find(
    (n) => n.slug === selectedCategorySlug || n.id === selectedCategorySlug
  );

  const hasSubCategories = activeNode && activeNode.children && activeNode.children.length > 0;

  return (
    <div className="space-y-2.5 font-sans">
      {/* 1. Primary Top-Level Category Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth [scroll-snap-type:x_mandatory] px-0.5">
        {/* "All" Pill */}
        <div className="[scroll-snap-align:start] shrink-0">
          <CategoryPill
            name="All Products"
            icon="Sparkle"
            isActive={!selectedCategorySlug}
            count={allProductsCount}
            onClick={() => onSelectCategory(null, null)}
          />
        </div>

        {/* Top-Level Categories */}
        {categoryTree.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug || selectedCategorySlug === cat.id;

          return (
            <div key={cat.id} className="[scroll-snap-align:start] shrink-0">
              <CategoryPill
                name={cat.name}
                icon={cat.icon}
                isActive={isSelected}
                count={cat.productCount}
                avgMargin={cat.avgProfitMarginPKR}
                onClick={() => onSelectCategory(cat.slug, null)}
              />
            </div>
          );
        })}
      </div>

      {/* 2. Secondary Sub-Category Slide-Down Strip (If Parent has Children) */}
      {hasSubCategories && activeNode && (
        <div className="p-2.5 sm:p-3 rounded-2xl bg-[var(--surface-alt)] border border-[var(--line)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--line)] text-xs">
            <span className="font-mono text-[10px] text-[var(--primary)] uppercase tracking-wider font-semibold flex items-center space-x-1">
              <span>{activeNode.name}</span>
              <CaretRight size={10} className="text-[var(--ink-soft)]" />
              <span className="text-[var(--ink)]">Sub-Categories</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--ink-soft)]">
              {activeNode.children.length} types
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none pb-1">
            {/* "All in Category" Pill */}
            <CategoryPill
              name={`All ${activeNode.name}`}
              size="sm"
              isActive={!selectedSubSlug}
              count={activeNode.productCount}
              onClick={() => onSelectCategory(activeNode.slug, null)}
            />

            {/* Sub-Category Pills */}
            {activeNode.children.map((sub) => {
              const isSubSelected = selectedSubSlug === sub.slug || selectedSubSlug === sub.id;

              return (
                <CategoryPill
                  key={sub.id}
                  name={sub.name}
                  icon={sub.icon}
                  size="sm"
                  isActive={isSubSelected}
                  count={sub.productCount}
                  avgMargin={sub.avgProfitMarginPKR}
                  onClick={() => onSelectCategory(activeNode.slug, sub.slug)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
