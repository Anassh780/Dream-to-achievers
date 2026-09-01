import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService, ProductSortOption } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { CategoryPillCarousel } from '@/components/categories/CategoryPillCarousel';
import { CategorySidebarTree } from '@/components/categories/CategorySidebarTree';
import { Button } from '@/components/ui/Button';
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
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      
      {/* 1. Storefront Header Banner */}
      <header className="px-6 sm:px-8 pt-10 sm:pt-14 pb-8 border-b border-[#E3DCC8] bg-[#F1ECDD]">
        <div className="max-w-[1180px] mx-auto space-y-4">
          
          {/* Dynamic Breadcrumbs */}
          <nav className="flex items-center space-x-1.5 text-xs font-mono text-[#5B5C50]">
            <Link to="/" className="hover:text-[#1E241F] flex items-center space-x-1 transition-colors">
              <House size={13} />
              <span>Home</span>
            </Link>
            <CaretRight size={10} className="text-[#7C7D70]" />
            <button
              type="button"
              onClick={() => handleSelectCategory(null, null)}
              className={`hover:text-[#1E241F] transition-colors ${
                !selectedCategorySlug ? 'text-[#1F4D3E] font-semibold' : ''
              }`}
            >
              Wholesale Catalog
            </button>
            {breadcrumbChain.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <CaretRight size={10} className="text-[#7C7D70]" />
                <button
                  type="button"
                  onClick={() =>
                    idx === 0
                      ? handleSelectCategory(crumb.slug, null)
                      : handleSelectCategory(breadcrumbChain[0].slug, crumb.slug)
                  }
                  className={`hover:text-[#1E241F] transition-colors truncate max-w-[140px] ${
                    idx === breadcrumbChain.length - 1 ? 'text-[#1F4D3E] font-semibold' : ''
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="eyebrow">
                <ShieldCheck size={13} weight="bold" />
                <span>Direct B2B Distribution Inventory</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium text-[#1E241F] tracking-tight">
                {activeCategory ? activeCategory.name : 'Wholesale Products Catalog'}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B5C50] leading-relaxed">
                {activeCategory?.description ||
                  'Explore verified high-demand product inventory with transparent unit economics. Purchase at wholesale cost and earn direct gross profit margins on every unit distributed.'}
              </p>
            </div>

            {/* Catalog SKU & Margin Summary */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8] flex items-center space-x-4 shrink-0 text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-[#5B5C50] block font-mono">Available SKUs</span>
                <span className="font-bold text-[#1E241F] font-mono flex items-center space-x-1">
                  <Package size={13} className="text-[#1F4D3E]" />
                  <span>{filteredProducts.length}</span>
                </span>
              </div>
              <div className="border-l border-[#E3DCC8] pl-4">
                <span className="text-[10px] text-[#5B5C50] block font-mono">Max Unit Margin</span>
                <span className="font-bold text-[#B8862E] font-mono">
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
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
          
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or keywords..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#7C7D70] text-xs focus:outline-none focus:border-[#1F4D3E] transition-colors font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort & Filter Reset */}
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-[#5B5C50] font-mono hidden sm:inline flex items-center space-x-1">
              <SlidersHorizontal size={13} />
              <span>Sort By:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E] cursor-pointer font-sans"
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
                className="text-xs text-[#5B5C50] hover:text-[#1E241F] underline underline-offset-2 shrink-0 font-mono"
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
              <div className="p-12 rounded-2xl bg-white border border-[#E3DCC8] text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] flex items-center justify-center mx-auto">
                  <Package size={22} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-medium text-base text-[#1E241F]">
                    No products match your search or filter
                  </h3>
                  <p className="text-xs text-[#5B5C50] max-w-sm mx-auto">
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
                  className="text-xs"
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
                    className="rounded-xl bg-white border border-[#E3DCC8] overflow-hidden hover:border-[#D2C8AF] hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      {/* Product Image Tile */}
                      <div className="aspect-[16/10] bg-[#FAF7EF] relative overflow-hidden border-b border-[#E3DCC8]">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300 opacity-95 group-hover:opacity-100"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/90 text-[#1E241F] border border-[#E3DCC8] shadow-2xs">
                            {product.category}
                          </span>
                        </div>
                        {product.isFeatured && (
                          <div className="absolute top-2.5 right-2.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EFE2C4] text-[#B8862E] border border-[#B8862E]/30">
                              FEATURED
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Content Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#5B5C50]">
                          <span>SKU: {product.sku}</span>
                          <span className={product.inStock ? 'text-[#1F4D3E] font-medium' : 'text-rose-600'}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        <h3 className="font-serif font-medium text-[15px] text-[#1E241F] group-hover:text-[#1F4D3E] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-[#5B5C50] line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Economics & Action Footer */}
                    <div className="p-4 pt-0 space-y-3">
                      {/* Pricing Box */}
                      <div className="p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[#5B5C50]">
                          <span>Retail Price:</span>
                          <span className="text-[#1E241F] font-mono font-medium">
                            PKR {product.retailPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#5B5C50]">
                          <span>Wholesale Cost:</span>
                          <span className="text-[#1F4D3E] font-mono font-medium">
                            PKR {product.partnerPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="pt-1 border-t border-[#E3DCC8] flex items-center justify-between font-medium">
                          <span className="text-[#1E241F]">Partner Margin:</span>
                          <span className="text-[#B8862E] font-mono font-semibold">
                            +PKR {product.grossMargin.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Detail CTA Button */}
                      <Link to={`/products/${product.slug}`} className="block">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-between text-xs font-medium group/btn hover:bg-[#F1ECDD]"
                        >
                          <span>View Economics &amp; Details</span>
                          <ArrowRight
                            size={12}
                            className="group-hover/btn:translate-x-1 transition-transform text-[#1F4D3E]"
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
