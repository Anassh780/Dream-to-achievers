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
  // Set default expanded nodes to include the selected category
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
      <div className="p-4 rounded-3xl bg-[#060B18] border border-white/[0.08] shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center space-x-2">
            <Tag size={16} className="text-cyan-400" />
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-white">
              Category Tree
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {allProductsCount ?? 0} items
          </span>
        </div>

        {/* Tree Nodes List */}
        <nav className="space-y-1 text-xs">
          {/* Root "All Products" Node */}
          <button
            type="button"
            onClick={() => onSelectCategory(null, null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
              !selectedCategorySlug
                ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sparkle size={15} className={!selectedCategorySlug ? 'text-cyan-400' : 'text-slate-400'} />
              <span>All Products</span>
            </div>
            {allProductsCount !== undefined && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
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
                  className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    isParentSelected && !selectedSubSlug
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                      : isParentSelected
                      ? 'text-cyan-200 bg-white/[0.04]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={(e) => toggleExpand(cat.id, e)}
                        className="p-0.5 rounded text-slate-400 hover:text-white"
                      >
                        {isExpanded ? <CaretDown size={13} /> : <CaretRight size={13} />}
                      </button>
                    )}
                    {!hasChildren && <span className="w-3.5" />}
                    <CategoryIcon
                      name={cat.icon}
                      size={15}
                      className={isParentSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>

                  {cat.productCount !== undefined && cat.productCount > 0 && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isParentSelected
                          ? 'bg-cyan-400/30 text-cyan-200 border border-cyan-400/40'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {cat.productCount}
                    </span>
                  )}
                </div>

                {/* Sub-Categories (Depth 1) */}
                {hasChildren && isExpanded && (
                  <div className="pl-6 space-y-0.5 border-l border-white/[0.06] ml-4 py-1 animate-in fade-in duration-150">
                    {cat.children.map((sub) => {
                      const isSubSelected =
                        isParentSelected && (selectedSubSlug === sub.slug || selectedSubSlug === sub.id);

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onSelectCategory(cat.slug, sub.slug)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] transition-all ${
                            isSubSelected
                              ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSubSelected ? 'bg-cyan-400' : 'bg-slate-600'
                              }`}
                            />
                            <span className="truncate">{sub.name}</span>
                          </div>

                          {sub.productCount !== undefined && sub.productCount > 0 && (
                            <span className="text-[9px] font-mono text-slate-400 font-medium">
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
