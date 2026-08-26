import React, { useState } from 'react';
import { CategoryTreeNode } from '@/types';
import { CategoryIcon } from './CategoryIcon';
import { CaretDown, CaretRight, Sparkle, Tag } from '@phosphor-icons/react';

interface CategorySidebarTreeProps {
  categoryTree: CategoryTreeNode[];
  selectedCategorySlug: string | null;
  selectedSubSlug: string | null;
  onSelectCategory: (slug: string | null, subSlug?: string | null) => void;
  allProductsCount?: number;
}

export const CategorySidebarTree: React.FC<CategorySidebarTreeProps> = ({
  categoryTree,
  selectedCategorySlug,
  selectedSubSlug,
  onSelectCategory,
  allProductsCount,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    categoryTree.forEach((c) => {
      if (c.slug === selectedCategorySlug || c.id === selectedCategorySlug) {
        initial[c.id] = true;
      }
    });
    return initial;
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-64 shrink-0 font-sans sticky top-24 space-y-4">
      <div className="p-4 rounded-xl bg-white border border-[#E3DCC8] shadow-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
          <div className="flex items-center space-x-2">
            <Tag size={15} className="text-[#1F4D3E]" />
            <h3 className="font-serif font-medium text-xs uppercase tracking-wider text-[#1E241F]">
              Category Taxonomy
            </h3>
          </div>
          <span className="text-[10.5px] font-mono text-[#5B5C50]">
            {allProductsCount ?? 0} SKUs
          </span>
        </div>

        {/* Tree Nodes List */}
        <nav className="space-y-1 text-xs">
          {/* Root "All Products" Node */}
          <button
            type="button"
            onClick={() => onSelectCategory(null, null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
              !selectedCategorySlug
                ? 'bg-[#1F4D3E] text-white font-medium shadow-xs'
                : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sparkle size={14} className={!selectedCategorySlug ? 'text-white' : 'text-[#7C7D70]'} />
              <span>All Products</span>
            </div>
            {allProductsCount !== undefined && (
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${!selectedCategorySlug ? 'bg-white/20 text-white' : 'bg-[#F1ECDD] text-[#5B5C50]'}`}>
                {allProductsCount}
              </span>
            )}
          </button>

          {/* Top-Level Categories */}
          {categoryTree.map((cat) => {
            const isParentSelected = selectedCategorySlug === cat.slug || selectedCategorySlug === cat.id;
            const isExpanded = expandedIds[cat.id] ?? isParentSelected;
            const hasChildren = cat.children && cat.children.length > 0;

            return (
              <div key={cat.id} className="space-y-0.5">
                {/* Parent Row */}
                <div
                  onClick={() => onSelectCategory(cat.slug, null)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    isParentSelected && !selectedSubSlug
                      ? 'bg-[#1F4D3E] text-white font-medium shadow-xs'
                      : isParentSelected
                      ? 'text-[#1F4D3E] bg-[#F1ECDD] font-medium'
                      : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(cat.id, e)}
                        className="p-0.5 rounded text-[#7C7D70] hover:text-[#1E241F]"
                      >
                        {isExpanded ? <CaretDown size={12} /> : <CaretRight size={12} />}
                      </button>
                    )}
                    <CategoryIcon name={cat.icon} size={14} className="shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  {cat.productCount !== undefined && cat.productCount > 0 && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isParentSelected && !selectedSubSlug ? 'bg-white/20 text-white' : 'bg-[#F1ECDD] text-[#5B5C50]'}`}>
                      {cat.productCount}
                    </span>
                  )}
                </div>

                {/* Subcategory Tier 2 */}
                {hasChildren && isExpanded && (
                  <div className="pl-4 space-y-0.5 border-l border-[#E3DCC8] ml-3 mt-1">
                    {cat.children.map((sub) => {
                      const isSubSelected = selectedSubSlug === sub.slug || selectedSubSlug === sub.id;

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCategory(cat.slug, sub.slug);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11.5px] transition-colors ${
                            isSubSelected
                              ? 'bg-[#1F4D3E] text-white font-medium'
                              : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-[#FAF7EF]'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-[#7C7D70]">└──</span>
                            <span className="truncate">{sub.name}</span>
                          </div>
                          {sub.productCount !== undefined && sub.productCount > 0 && (
                            <span className="text-[9.5px] font-mono text-[#7C7D70]">
                              {sub.productCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
