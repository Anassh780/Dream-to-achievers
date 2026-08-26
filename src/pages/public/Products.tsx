import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, ProductSortOption } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { CategoryPillCarousel } from '@/components/categories/CategoryPillCarousel';
import { CategorySidebarTree } from '@/components/categories/CategorySidebarTree';
import { CategoryIcon } from '@/components/categories/CategoryIcon';
import { Button } from '@/components/ui/Button';
import {
  MagnifyingGlass,
  ArrowRight,
  Sparkle,
  TrendUp,
  Package,
  SlidersHorizontal,
  X,
  CaretRight,
  ShieldCheck,
  House,
} from '@phosphor-icons/react';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Load all products and categories
  const allProducts = useMemo(() => productService.getAllProducts(), []);
  const allCategories = useMemo(() => categoryService.getAllCategories(), []);
  const aggregatedCategories = useMemo(
    () => categoryService.getAggregatedCategories(allProducts),
    [allProducts]
  );
  const categoryTree = useMemo(
    () => categoryService.buildCategoryTree(aggregatedCategories.filter((c) => c.status === 'active')),
    [aggregatedCategories]
  );

  // URL state sync
  const categoryParam = searchParams.get('category') || null;
  const subParam = searchParams.get('sub') || null;

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(categoryParam);
  const [selectedSubSlug, setSelectedSubSlug] = useState<string | null>(subParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortOption>('highest_margin');

  // Validate initial deep-linked category
  useEffect(() => {
    if (categoryParam) {
      const exists = allCategories.some(
        (c) =>
          (c.slug === categoryParam || c.id === categoryParam) && c.status === 'active'
      );
      if (exists) {
        setSelectedCategorySlug(categoryParam);
        setSelectedSubSlug(subParam);
      } else {
        setSelectedCategorySlug(null);
        setSelectedSubSlug(null);
        setSearchParams({}, { replace: true });
      }
    }
  }, [categoryParam, subParam, allCategories, setSearchParams]);

  // Handle Category Selection with URL sync
  const handleSelectCategory = (catSlug: string | null, subSlug: string | null = null) => {
    setSelectedCategorySlug(catSlug);
    setSelectedSubSlug(subSlug);

    const newParams = new URLSearchParams();
    if (catSlug) newParams.set('category', catSlug);
    if (subSlug) newParams.set('sub', subSlug);
    setSearchParams(newParams, { replace: true });
  };

  // Find current active category object for header details
  const activeCategory = useMemo(() => {
    if (selectedSubSlug) {
      return allCategories.find((c) => c.slug === selectedSubSlug || c.id === selectedSubSlug);
    }
    if (selectedCategorySlug) {
      return allCategories.find((c) => c.slug === selectedCategorySlug || c.id === selectedCategorySlug);
    }
    return null;
  }, [selectedCategorySlug, selectedSubSlug, allCategories]);

  // Breadcrumbs chain
  const breadcrumbChain = useMemo(() => {
    if (!activeCategory) return [];
    return categoryService.getCategoryHierarchy(activeCategory.id);
  }, [activeCategory]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    const filtered = productService.filterProducts(
      allProducts,
      selectedCategorySlug,
      selectedSubSlug,
      searchQuery
    );
    return productService.sortProducts(filtered, sortBy);
  }, [allProducts, selectedCategorySlug, selectedSubSlug, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      {/* 1. Storefront Hero Banner */}
      <section className="relative pt-24 sm:pt-28 pb-10 border-b border-white/[0.08] bg-radial-hero overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center sm:text-left">
          {/* Dynamic Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-400 justify-center sm:justify-start">
            <Link to="/" className="hover:text-cyan-300 flex items-center space-x-1 transition-colors">
              <House size={12} />
              <span>Home</span>
            </Link>
            <CaretRight size={10} className="text-slate-600" />
            <button
              type="button"
              onClick={() => handleSelectCategory(null, null)}
              className={`hover:text-cyan-300 transition-colors ${
                !selectedCategorySlug ? 'text-cyan-300 font-semibold' : ''
              }`}
            >
              Catalog
            </button>
            {breadcrumbChain.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <CaretRight size={10} className="text-slate-600" />
                <button
                  type="button"
                  onClick={() =>
                    idx === 0
                      ? handleSelectCategory(crumb.slug, null)
                      : handleSelectCategory(breadcrumbChain[0].slug, crumb.slug)
                  }
                  className={`hover:text-cyan-300 transition-colors truncate max-w-[140px] ${
                    idx === breadcrumbChain.length - 1 ? 'text-cyan-300 font-semibold' : ''
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
                <Sparkle size={11} weight="fill" className="text-cyan-400" />
                <span>Wholesale Distribution Network</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
                {activeCategory ? activeCategory.name : 'Wholesale Products Catalog'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {activeCategory?.description ||
                  'Explore verified high-margin product inventory. Partners purchase at wholesale cost and earn direct gross margins on every unit distributed.'}
              </p>
            </div>

            {/* Quick Stats Pill */}
            {activeCategory && (
              <div className="p-3 rounded-2xl bg-[#060B18] border border-white/[0.08] flex items-center space-x-4 shrink-0 self-start sm:self-auto text-xs shadow-lg">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono">Available SKUs</span>
                  <span className="font-bold text-white font-jetbrains flex items-center space-x-1">
                    <Package size={13} className="text-cyan-400" />
                    <span>{filteredProducts.length}</span>
                  </span>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <span className="text-[10px] text-slate-400 block font-mono">Direct Margin</span>
                  <span className="font-bold text-emerald-400 font-jetbrains flex items-center space-x-1">
                    <TrendUp size={13} />
                    <span>Up to +PKR 1,300</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main Storefront Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Mobile Category Pill Carousel (< 1024px) */}
        <div className="lg:hidden">
          <CategoryPillCarousel
            categoryTree={categoryTree}
            selectedCategorySlug={selectedCategorySlug}
            selectedSubSlug={selectedSubSlug}
            onSelectCategory={handleSelectCategory}
            allProductsCount={allProducts.length}
          />
        </div>

        {/* Search & Sort Bar */}
        <div className="p-3 sm:p-4 rounded-2xl bg-[#060B18] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title, SKU, or keywords..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline flex items-center space-x-1">
              <SlidersHorizontal size={13} />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 transition-all cursor-pointer font-sans"
            >
              <option value="highest_margin">Highest Profit Margin</option>
              <option value="lowest_margin">Lowest Profit Margin</option>
              <option value="most_stock">In-Stock First</option>
              <option value="recently_added">Recently Added</option>
              <option value="price_asc">Wholesale Price: Low to High</option>
              <option value="price_desc">Wholesale Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* 3. Responsive Content Body: Left Sticky Sidebar (Desktop) + Products Grid */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Desktop Left Sticky Tree (≥ 1024px) */}
          <div className="hidden lg:block">
            <CategorySidebarTree
              categoryTree={categoryTree}
              selectedCategorySlug={selectedCategorySlug}
              selectedSubSlug={selectedSubSlug}
              onSelectCategory={handleSelectCategory}
              allProductsCount={allProducts.length}
            />
          </div>

          {/* Products Grid Column */}
          <div className="flex-1 w-full space-y-6">
            {filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="p-12 sm:p-16 rounded-3xl bg-[#060B18] border border-white/[0.08] text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <Package size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base text-white">
                    No products found in this category
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    There are no products currently active matching your selected filters. Reset filters to view our full catalog.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleSelectCategory(null, null);
                    setSearchQuery('');
                  }}
                  className="rounded-xl text-xs font-semibold"
                >
                  View All Products Catalog
                </Button>
              </div>
            ) : (
              /* 2-Column (Mobile) / 3-Column (Desktop) Product Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-3xl bg-[#060B18] border border-white/[0.08] overflow-hidden shadow-xl hover:border-cyan-400/30 transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Product Image Tile */}
                      <div className="aspect-[16/10] bg-[#030712] relative overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#030712]/90 backdrop-blur-md text-white border border-white/10">
                            {product.category}
                          </span>
                        </div>
                        {product.isFeatured && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              HOT
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Content Details */}
                      <div className="px-5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>SKU: {product.sku}</span>
                          <span className={product.inStock ? 'text-emerald-400' : 'text-rose-400'}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <h3 className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Economics & Action Footer */}
                    <div className="p-5 pt-3 space-y-3">
                      {/* Pricing Pill */}
                      <div className="p-3 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Retail Selling Price:</span>
                          <span className="text-white font-medium font-jetbrains">
                            PKR {product.retailPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Partner Wholesale:</span>
                          <span className="text-cyan-300 font-medium font-jetbrains">
                            PKR {product.partnerPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between font-semibold">
                          <span className="text-slate-300">Partner Profit Margin:</span>
                          <span className="text-emerald-400 font-mono font-bold">
                            +PKR {product.grossMargin.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Detail CTA Button */}
                      <Link to={`/products/${product.slug}`} className="block">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full justify-between rounded-xl text-xs font-semibold group/btn"
                        >
                          <span>View Product Details</span>
                          <ArrowRight
                            size={12}
                            className="group-hover/btn:translate-x-1 transition-transform text-cyan-400"
                          />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
