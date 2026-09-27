import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, ProductSortOption } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { CategoryPillCarousel } from '@/components/categories/CategoryPillCarousel';
import { CategorySidebarTree } from '@/components/categories/CategorySidebarTree';
import { Button } from '@/components/ui/Button';
import { SEOHead } from '@/components/common/SEOHead';
import {
  MagnifyingGlass,
  ArrowRight,
  Package,
  SlidersHorizontal,
  X,
  CaretRight,
  House,
  ShieldCheck,
} from '@phosphor-icons/react';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [syncKey, setSyncKey] = useState(0);

  useEffect(() => {
    const handleSync = () => setSyncKey((prev) => prev + 1);
    window.addEventListener('dta_products_update', handleSync);
    window.addEventListener('dta_categories_update', handleSync);
    window.addEventListener('dta_storage_change', handleSync);
    return () => {
      window.removeEventListener('dta_products_update', handleSync);
      window.removeEventListener('dta_categories_update', handleSync);
      window.removeEventListener('dta_storage_change', handleSync);
    };
  }, []);

  // Load all products and categories reactively
  const allProducts = useMemo(() => productService.getAllProducts(), [syncKey]);
  const allCategories = useMemo(() => categoryService.getAllCategories(), [syncKey]);
  const aggregatedCategories = useMemo(
    () => categoryService.getAggregatedCategories(allProducts),
    [allProducts, syncKey]
  );
  const categoryTree = useMemo(
    () => categoryService.buildCategoryTree(aggregatedCategories.filter((c) => c.status === 'active')),
    [aggregatedCategories, syncKey]
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title={activeCategory ? `${activeCategory.name} — Wholesale Products | Dream to Achievers` : 'Wholesale Products Catalog | Dream to Achievers'}
        description={activeCategory?.description || 'Browse verified wholesale products at direct trade rates with transparent unit margins (+PKR 500–1,300) and nationwide COD fulfillment on Dream to Achievers.'}
        canonicalPath={selectedCategorySlug ? `/products?category=${selectedCategorySlug}` : '/products'}
        ogType="website"
      />
      
      {/* 1. Storefront Header Banner */}
      <header className="px-6 sm:px-8 pt-10 sm:pt-14 pb-10 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D9C08A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1180px] mx-auto space-y-5 relative z-10">
          
          {/* Dynamic Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-[#9EABA2]">
            <Link to="/" className="hover:text-[#D9C08A] flex items-center gap-1 transition-colors">
              <House size={13} />
              <span>Home</span>
            </Link>
            <CaretRight size={10} className="text-[#9EABA2]/60" />
            <button
              type="button"
              onClick={() => handleSelectCategory(null, null)}
              className={`hover:text-[#D9C08A] transition-colors ${
                !selectedCategorySlug ? 'text-[#D9C08A] font-semibold' : ''
              }`}
            >
              Wholesale Catalog
            </button>
            {breadcrumbChain.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <CaretRight size={10} className="text-[#9EABA2]/60" />
                <button
                  type="button"
                  onClick={() =>
                    idx === 0
                      ? handleSelectCategory(crumb.slug, null)
                      : handleSelectCategory(breadcrumbChain[0].slug, crumb.slug)
                  }
                  className={`hover:text-[#D9C08A] transition-colors truncate max-w-[140px] ${
                    idx === breadcrumbChain.length - 1 ? 'text-[#D9C08A] font-semibold' : ''
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
                <ShieldCheck size={13} weight="bold" />
                <span>Verified B2B Direct Distribution</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#F4F7F5] tracking-tight">
                {activeCategory ? activeCategory.name : 'Wholesale Products Catalog'}
              </h1>
              <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
                {activeCategory?.description ||
                  'Explore verified high-demand product inventory with transparent unit economics. Purchase at wholesale trade cost and earn direct gross profit margins on every unit distributed.'}
              </p>
            </div>

            {/* Catalog SKU & Margin Summary */}
            <div className="p-4 rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-[#D9C08A]/30 flex items-center justify-between sm:justify-start space-x-5 shrink-0 text-xs shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full sm:w-auto">
              <div>
                <span className="text-[10px] text-[#9EABA2] block font-mono">Available SKUs</span>
                <span className="font-bold text-[#F4F7F5] font-mono flex items-center space-x-1.5 text-sm">
                  <Package size={14} className="text-[#34D399]" />
                  <span>{filteredProducts.length}</span>
                </span>
              </div>
              <div className="border-l border-white/10 pl-5">
                <span className="text-[10px] text-[#9EABA2] block font-mono">Max Unit Margin</span>
                <span className="font-bold text-[#34D399] font-mono text-sm bg-[#34D399]/10 px-2 py-0.5 rounded border border-[#34D399]/25 inline-block">
                  Up to +PKR 1,300
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Storefront Layout */}
      <div className="max-w-[1180px] mx-auto px-6 sm:px-8 pt-8 space-y-6">
        
        {/* Mobile Category Shortcuts Carousel (< 1024px) */}
        <div className="lg:hidden">
          <CategoryPillCarousel
            categoryTree={categoryTree}
            selectedCategorySlug={selectedCategorySlug}
            selectedSubSlug={selectedSubSlug}
            onSelectCategory={handleSelectCategory}
            allProductsCount={allProducts.length}
          />
        </div>

        {/* Search & Sort Toolbar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
          
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or keywords..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] transition-colors font-sans shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9EABA2] hover:text-[#F4F7F5]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort & Filter Reset */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-[#9EABA2] font-mono hidden sm:inline flex items-center space-x-1.5">
              <SlidersHorizontal size={13} className="text-[#D9C08A]" />
              <span>Sort By:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="px-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] text-xs focus:outline-none focus:border-[#D9C08A] cursor-pointer font-sans"
            >
              <option value="highest_margin">Highest Profit Margin</option>
              <option value="lowest_margin">Lowest Profit Margin</option>
              <option value="most_stock">In-Stock First</option>
              <option value="recently_added">Recently Added</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            {(selectedCategorySlug || searchQuery) && (
              <button
                onClick={() => {
                  handleSelectCategory(null, null);
                  setSearchQuery('');
                }}
                className="text-xs text-[#D9C08A] hover:underline underline-offset-2 shrink-0 font-mono"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* 3. Main Grid: Left Sticky Sidebar (Desktop) + Products Column */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Desktop Left Sticky Category Tree (≥ 1024px) */}
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
              <div className="p-12 rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 text-center space-y-4 shadow-xl">
                <div className="w-14 h-14 rounded-2xl bg-[#131E1A] border border-[#D9C08A]/30 text-[#D9C08A] flex items-center justify-center mx-auto shadow-md">
                  <Package size={26} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif font-normal text-lg text-[#F4F7F5]">
                    No products match your search or filter
                  </h3>
                  <p className="text-xs text-[#9EABA2] max-w-sm mx-auto leading-relaxed">
                    Try searching for different keywords or clear the category filters to browse all inventory.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleSelectCategory(null, null);
                    setSearchQuery('');
                  }}
                  className="text-xs border-[#D9C08A]/40 text-[#D9C08A] hover:bg-[#D9C08A]/10"
                >
                  View All Products Catalog
                </Button>
              </div>
            ) : (
              /* 2-Column (Mobile) / 3-Column (Desktop) Product Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#D9C08A]/40 hover:shadow-[0_15px_35px_rgba(0,0,0,0.6),0_0_20px_rgba(217,192,138,0.08)] active:scale-[0.99] flex flex-col justify-between group shadow-lg touch-manipulation"
                  >
                    <div>
                      {/* Product Image Tile */}
                      <div className="aspect-[16/10] bg-[#070B09] relative overflow-hidden border-b border-white/10">
                        <img
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#070B09]/80 backdrop-blur-md text-[#D9C08A] border border-[#D9C08A]/30 shadow-sm">
                            {product.category}
                          </span>
                        </div>
                        {product.isFeatured && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D9C08A] text-[#070B09] shadow-sm">
                              FEATURED
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Content Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#9EABA2]">
                          <span>SKU: {product.sku}</span>
                          <span className={product.inStock ? 'text-[#34D399] font-medium' : 'text-rose-400'}>
                            {product.inStock ? '● In Stock' : '○ Out of Stock'}
                          </span>
                        </div>

                        <h3 className="font-serif font-medium text-[15px] text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#9EABA2] line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Economics & Action Footer */}
                    <div className="p-4 pt-0 space-y-3">
                      {/* Pricing Box */}
                      <div className="p-3 rounded-xl bg-[#070B09]/90 border border-white/[0.08] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[#9EABA2]">
                          <span>Retail Price:</span>
                          <span className="text-[#C4D0C8] font-mono font-medium">
                            PKR {product.retailPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#9EABA2]">
                          <span>Wholesale Cost:</span>
                          <span className="text-[#34D399] font-mono font-medium">
                            PKR {product.partnerPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-1.5 border-t border-white/[0.08] flex items-center justify-between font-medium">
                          <span className="text-[#F4F7F5]">Partner Margin:</span>
                          <span className="text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded border border-[#34D399]/25 font-mono font-bold">
                            +PKR {product.grossMargin.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Detail CTA Button */}
                      <Link to={`/products/${product.slug}`} className="block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-xs font-medium group/btn border-white/15 hover:border-[#D9C08A]/50 hover:bg-[#D9C08A]/10 text-[#F4F7F5] transition-all"
                        >
                          <span>View Economics &amp; Details</span>
                          <ArrowRight
                            size={12}
                            className="group-hover/btn:translate-x-1 transition-transform text-[#D9C08A]"
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
