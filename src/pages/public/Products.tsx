import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SEED_PRODUCTS } from '@/config/products';
import { Button } from '@/components/ui/Button';
import { MagnifyingGlass, ArrowRight, Sparkle } from '@phosphor-icons/react';

export const Products: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Skincare & Beauty', 'Electronics & Tech', 'Home & Lifestyle', 'Wellness & Fitness'];

  const filteredProducts = useMemo(() => {
    return SEED_PRODUCTS.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-16 pb-24 max-w-6xl mx-auto px-5 sm:px-8 font-sans">
      {/* Header */}
      <section className="pt-8 text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-mono text-[#60A5FA] uppercase tracking-wider">
          Wholesale Distribution Catalog
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight">
          Curated Wholesale Products
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
          Explore our consumer catalog. Partners purchase at wholesale rates and earn direct gross margins on every customer purchase.
        </p>
      </section>

      {/* Search & Filter Bar */}
      <section className="double-bezel">
        <div className="double-bezel-inner p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by title, keyword..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0A0F19] border border-white/10 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.8 rounded-xl text-xs transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#3B82F6] text-white font-medium shadow-sm'
                    : 'bg-[#0A0F19] text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Product Grid */}
      <section>
        {filteredProducts.length === 0 ? (
          <div className="double-bezel">
            <div className="double-bezel-inner p-12 text-center space-y-3 text-xs">
              <p className="text-[#94A3B8]">No products match your search or filter criteria.</p>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Reset Search Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="double-bezel group">
                <div className="double-bezel-inner p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    {/* Large Image Frame */}
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#0A0F19] relative">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 text-[10px] font-medium px-2.5 py-0.8 rounded-full bg-[#06090F]/90 backdrop-blur-sm text-white">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <h3 className="font-heading font-bold text-base text-white group-hover:text-[#60A5FA] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="p-3.5 rounded-xl bg-[#0A0F19] border border-white/[0.04] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[#94A3B8]">
                        <span>Retail Selling Price:</span>
                        <span className="text-white font-medium">PKR {product.retailPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#94A3B8]">
                        <span>Partner Wholesale Cost:</span>
                        <span className="text-[#60A5FA] font-medium">PKR {product.partnerPrice.toLocaleString()}</span>
                      </div>
                      <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between font-semibold">
                        <span className="text-[#94A3B8]">Direct Gross Profit:</span>
                        <span className="text-[#22C55E] font-mono">+PKR {product.grossMargin.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <Link to={`/products/${product.slug}`}>
                    <Button variant="secondary" size="sm" className="w-full justify-between rounded-xl group/btn text-xs">
                      <span>View Product Details</span>
                      <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
