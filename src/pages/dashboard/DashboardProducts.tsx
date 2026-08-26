import React, { useState, useMemo } from 'react';
import { productService, ProductSortOption } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { salesService } from '@/services/salesService';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { CategoryPill } from '@/components/categories/CategoryPill';
import {
  ShoppingCart,
  Check,
  X,
  FilePdf,
  SlidersHorizontal,
  MagnifyingGlass,
  TrendUp,
  Package,
  Printer,
  Sparkle,
  Eye,
  Rows,
  SquaresFour,
} from '@phosphor-icons/react';

export const DashboardProducts: React.FC = () => {
  const { user } = useAuth();
  const allProducts = useMemo(() => productService.getAllProducts(), []);
  const allCategories = useMemo(() => categoryService.getAllCategories(), []);
  const categoryTree = useMemo(
    () => categoryService.buildCategoryTree(allCategories.filter((c) => c.status === 'active')),
    [allCategories]
  );

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortOption>('highest_margin');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  // Bulk Catalog PDF Export state
  const [isExporting, setIsExporting] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    const filtered = productService.filterProducts(
      allProducts,
      selectedCategorySlug,
      null,
      searchQuery
    );
    return productService.sortProducts(filtered, sortBy);
  }, [allProducts, selectedCategorySlug, searchQuery, sortBy]);

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct || !customerName) return;

    salesService.recordSale({
      userId: user.id,
      product: selectedProduct,
      customerName,
      customerEmail,
      quantity,
    });

    setSuccessMsg(
      `Sale recorded for ${selectedProduct.name}. +PKR ${(
        selectedProduct.grossMargin * quantity
      ).toLocaleString()} gross profit margin credited.`
    );
    setSelectedProduct(null);
    setCustomerName('');
    setCustomerEmail('');
    setQuantity(1);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handleExportCatalog = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowCatalogModal(true);
    }, 600);
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl selection:bg-cyan-500/30">
      {/* 1. Header & Quick Catalog Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
            <span>Partner Hub</span>
            <span>/</span>
            <span>Wholesale Inventory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
            Wholesale Products & Margin Ledger
          </h1>
          <p className="text-xs text-slate-400">
            Browse verified wholesale SKUs, review unit profit margins, and record client orders.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            onClick={handleExportCatalog}
            disabled={isExporting}
            variant="secondary"
            size="sm"
            className="rounded-xl text-xs font-semibold"
            iconLeft={<FilePdf size={14} className="text-cyan-400" />}
          >
            {isExporting ? 'Preparing Sheet...' : 'Export Catalog PDF'}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center space-x-2 shadow-lg animate-in fade-in">
          <Check size={16} weight="bold" className="text-emerald-400 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* 2. Category Filter Pill Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <CategoryPill
          name="All Inventory"
          icon="Sparkle"
          isActive={!selectedCategorySlug}
          count={allProducts.length}
          onClick={() => setSelectedCategorySlug(null)}
        />
        {categoryTree.map((cat) => (
          <CategoryPill
            key={cat.id}
            name={cat.name}
            icon={cat.icon}
            isActive={selectedCategorySlug === cat.slug || selectedCategorySlug === cat.id}
            count={cat.productCount}
            avgMargin={cat.avgProfitMarginPKR}
            onClick={() => setSelectedCategorySlug(cat.slug)}
          />
        ))}
      </div>

      {/* 3. Search, Sort & View Mode Toggle Bar */}
      <div className="p-3.5 rounded-2xl bg-[#060B18] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <SlidersHorizontal size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="px-2.5 py-1.5 rounded-lg bg-[#030712] border border-white/10 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="highest_margin">Highest Margin (PKR)</option>
              <option value="lowest_margin">Lowest Margin</option>
              <option value="most_stock">In Stock First</option>
              <option value="recently_added">Recently Added</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center space-x-1 bg-[#030712] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
              title="Grid View"
            >
              <SquaresFour size={14} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
              title="Table View"
            >
              <Rows size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Products Presentation (Grid vs Table) */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#060B18] border border-white/[0.08] text-center space-y-3">
          <Package size={28} className="mx-auto text-cyan-400" />
          <p className="text-slate-300 text-xs">No products found matching your current filter.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedCategorySlug(null);
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="p-5 rounded-3xl bg-[#060B18] border border-white/[0.08] shadow-xl hover:border-cyan-400/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#030712] relative">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#030712]/90 backdrop-blur-sm text-white border border-white/10">
                    {prod.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>SKU: {prod.sku}</span>
                    <span className="text-emerald-400">In Stock</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-white truncate">{prod.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {prod.shortDescription}
                  </p>
                </div>

                {/* Economics Box */}
                <div className="p-3 rounded-2xl bg-[#030712] border border-white/[0.06] text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Retail Selling Price:</span>
                    <span className="text-white font-medium font-jetbrains">
                      PKR {prod.retailPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Partner Wholesale:</span>
                    <span className="text-cyan-300 font-medium font-jetbrains">
                      PKR {prod.partnerPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-between font-semibold">
                    <span className="text-slate-300">Your Profit Margin:</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      +PKR {prod.grossMargin.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center rounded-xl font-bold text-xs shadow-md"
                onClick={() => setSelectedProduct(prod)}
                iconLeft={<ShoppingCart size={14} />}
              >
                Record Client Sale
              </Button>
            </div>
          ))}
        </div>
      ) : (
        /* Table View (Desktop) */
        <div className="rounded-3xl bg-[#060B18] border border-white/[0.08] overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#030712] text-[10px] font-mono uppercase text-slate-400 border-b border-white/[0.08]">
              <tr>
                <th className="p-3.5 pl-5">Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Wholesale Cost</th>
                <th className="p-3.5">Retail Price</th>
                <th className="p-3.5">Profit Margin</th>
                <th className="p-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="flex items-center space-x-3">
                      <img src={prod.imageUrl} alt={prod.name} className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-white truncate max-w-[180px]">{prod.name}</p>
                        <p className="text-[10px] font-mono text-slate-500">{prod.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {prod.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-300">PKR {prod.partnerPrice.toLocaleString()}</td>
                  <td className="p-3.5 font-mono text-white">PKR {prod.retailPrice.toLocaleString()}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    +PKR {prod.grossMargin.toLocaleString()}
                  </td>
                  <td className="p-3.5 pr-5 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => setSelectedProduct(prod)}
                    >
                      Record Sale
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Record Client Sale Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#060B18] border border-white/15 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-heading font-bold text-white">
                  Record Sale: {selectedProduct.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">SKU: {selectedProduct.sku}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ahmed Khan"
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Customer Email / Contact</label>
                <input
                  type="text"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@email.com or WhatsApp number"
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-300 font-medium">Quantity Sold</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Realtime Economics Calculation */}
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Gross Margin per Unit:</span>
                  <span className="font-mono text-cyan-300">+PKR {selectedProduct.grossMargin.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-cyan-500/20 text-white">
                  <span>Total Margin Credited:</span>
                  <span className="font-mono text-emerald-400">
                    +PKR {(selectedProduct.grossMargin * quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-1/2 rounded-xl"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="w-1/2 rounded-xl font-bold">
                  Submit Sale
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Bulk Catalog Export & Print Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[85vh] p-6 rounded-3xl bg-[#060B18] border border-white/15 shadow-2xl flex flex-col justify-between space-y-4 text-xs font-sans animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2">
                <FilePdf size={18} className="text-cyan-400" />
                <h3 className="text-sm font-heading font-bold text-white">
                  Export Wholesale Catalog Sheet ({filteredProducts.length} SKUs)
                </h3>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            {/* Printable Preview Sheet */}
            <div className="overflow-y-auto max-h-[50vh] p-4 rounded-2xl bg-[#030712] border border-white/[0.06] space-y-3 font-sans">
              <div className="text-center pb-3 border-b border-white/10 space-y-1">
                <h2 className="font-heading font-extrabold text-base text-white">
                  DreamToAchievers — Official Wholesale Catalog
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Generated for Partner: {user?.fullName || 'Active Partner'} • {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{p.sku} • {p.category}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="text-white font-medium">Retail: PKR {p.retailPrice.toLocaleString()}</p>
                      <p className="text-emerald-400 text-[11px]">Wholesale: PKR {p.partnerPrice.toLocaleString()} (+{p.grossMargin} profit)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] font-mono text-slate-400">
                Ready for high-resolution distribution & client quotes.
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setShowCatalogModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl font-bold"
                  onClick={() => window.print()}
                  iconLeft={<Printer size={14} />}
                >
                  Print / Save PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
