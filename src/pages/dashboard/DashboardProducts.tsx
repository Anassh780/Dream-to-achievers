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
  Rows,
  SquaresFour,
} from '@phosphor-icons/react';

export const DashboardProducts: React.FC = () => {
  const { user } = useAuth();
  const [syncKey, setSyncKey] = useState(0);

  React.useEffect(() => {
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

  const allProducts = useMemo(() => productService.getAllProducts(), [syncKey]);
  const allCategories = useMemo(() => categoryService.getAllCategories(), [syncKey]);
  const categoryTree = useMemo(
    () => categoryService.buildCategoryTree(allCategories.filter((c) => c.status === 'active')),
    [allCategories, syncKey]
  );

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortOption>('highest_margin');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [paymentProofNotes, setPaymentProofNotes] = useState('');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (typeof uploadEvent.target?.result === 'string') {
        setPaymentScreenshotUrl(uploadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProduct || !customerName || !customerPhone || !customerAddress) return;

    await salesService.recordSale({
      userId: user.id,
      product: selectedProduct,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerCity,
      paymentScreenshotUrl: paymentScreenshotUrl || undefined,
      paymentProofNotes: paymentProofNotes || undefined,
      quantity,
    });

    setSuccessMsg(
      `Order submitted for ${selectedProduct.name}! Admin operations will verify the client payment screenshot and update dispatch tracking.`
    );
    setSelectedProduct(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setCustomerCity('');
    setPaymentScreenshotUrl('');
    setPaymentProofNotes('');
    setQuantity(1);
    setTimeout(() => setSuccessMsg(''), 5500);
  };

  const handleExportCatalog = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowCatalogModal(true);
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[#D9C08A]/25">
      
      {/* 1. Header & Catalog Sheet Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#9EABA2]">
            <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-[#34D399] border-[#34D399]/30">Partner Hub</span>
            <span>/</span>
            <span>Wholesale Inventory</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F4F7F5] tracking-tight">
            Wholesale Products &amp; Margin Ledger
          </h1>
          <p className="text-xs text-[#9EABA2]">
            Browse verified wholesale SKUs, review unit profit margins, and record client sales orders.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportCatalog}
            disabled={isExporting}
            className="funding-ghost-pill px-4 py-2.5 text-xs font-medium text-[#F4F7F5] hover:border-white/20 inline-flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <FilePdf size={15} className="text-[#34D399]" />
            <span>{isExporting ? 'Preparing Sheet...' : 'Export Price Sheet PDF'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-xs flex items-center space-x-2 animate-in fade-in">
          <Check size={16} weight="bold" className="shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* 2. Category Filter Pill Strip */}
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
      <div className="funding-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/70 text-xs focus:outline-none focus:border-[#D9C08A] focus:ring-1 focus:ring-[#D9C08A]/30 transition-colors"
          />
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1.5 text-[#9EABA2]">
            <SlidersHorizontal size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#F4F7F5] text-xs focus:outline-none focus:border-[#D9C08A] cursor-pointer"
            >
              <option value="highest_margin" className="bg-[#070B09] text-[#F4F7F5]">Highest Margin (PKR)</option>
              <option value="lowest_margin" className="bg-[#070B09] text-[#F4F7F5]">Lowest Margin</option>
              <option value="most_stock" className="bg-[#070B09] text-[#F4F7F5]">In Stock First</option>
              <option value="recently_added" className="bg-[#070B09] text-[#F4F7F5]">Recently Added</option>
            </select>
          </div>

          {/* Grid vs Table View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-white/[0.03] p-1 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#34D399] text-[#070B09] font-bold shadow-xs' : 'text-[#9EABA2] hover:text-[#F4F7F5]'
              }`}
              title="Grid View"
            >
              <SquaresFour size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-[#34D399] text-[#070B09] font-bold shadow-xs' : 'text-[#9EABA2] hover:text-[#F4F7F5]'
              }`}
              title="Dense Table View"
            >
              <Rows size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Product Display Area (Grid View vs Table View) */}
      {filteredProducts.length === 0 ? (
        <div className="funding-card p-12 text-center space-y-2">
          <Package size={32} className="text-[#9EABA2]/60 mx-auto" />
          <h3 className="font-serif font-bold text-[#F4F7F5] text-base">No Products Found</h3>
          <p className="text-xs text-[#9EABA2]">No inventory matched your search filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Discovery View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="funding-card overflow-hidden flex flex-col justify-between hover:border-[#34D399]/40 hover:shadow-[0_20px_45px_-15px_rgba(52,211,153,0.15)] transition-all"
            >
              <div>
                <div className="aspect-[16/10] bg-white/[0.02] relative overflow-hidden border-b border-white/[0.08]">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <span className="funding-ghost-pill absolute top-2.5 left-2.5 text-[10px] font-mono px-2.5 py-0.5 text-[#F4F7F5] bg-[#070B09]/80 backdrop-blur-md">
                    {p.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#9EABA2]">
                    <span>SKU: {p.sku}</span>
                    <span className={p.inStock ? 'text-[#34D399] font-medium' : 'text-rose-400'}>
                      {p.inStock ? '● In Stock' : '○ Out of Stock'}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-[15px] text-[#F4F7F5] line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#9EABA2] line-clamp-2 leading-relaxed">
                    {p.shortDescription}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#9EABA2]">
                    <span>Suggested Retail:</span>
                    <span className="text-[#F4F7F5] font-mono font-semibold">PKR {p.retailPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#9EABA2]">
                    <span>Wholesale Cost:</span>
                    <span className="text-[#34D399] font-mono font-semibold">PKR {p.partnerPrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex justify-between items-center">
                    <span className="text-[#F4F7F5] font-bold">Your Profit Margin:</span>
                    <span className="text-[#34D399] bg-[#34D399]/15 border border-[#34D399]/30 px-2 py-0.5 rounded-md font-mono font-bold text-xs">
                      +PKR {p.grossMargin.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProduct(p)}
                  className="funding-sheen-btn w-full justify-center text-xs font-bold uppercase tracking-wider py-2.5 shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart size={15} weight="bold" />
                  <span>Record Client Sale &amp; Keep Profit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dense Operational Table View */
        <div className="funding-table-wrap overflow-x-auto shadow-xl">
          <table className="w-full min-w-[850px] text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#9EABA2] font-mono text-[11px]">
                <th className="p-3.5 whitespace-nowrap min-w-[220px]">Product Details</th>
                <th className="p-3.5 whitespace-nowrap min-w-[130px]">SKU / Category</th>
                <th className="p-3.5 whitespace-nowrap min-w-[110px]">Stock Status</th>
                <th className="p-3.5 text-right whitespace-nowrap min-w-[110px]">Retail Price</th>
                <th className="p-3.5 text-right whitespace-nowrap min-w-[110px]">Wholesale Cost</th>
                <th className="p-3.5 text-right whitespace-nowrap min-w-[110px]">Gross Margin</th>
                <th className="p-3.5 text-center whitespace-nowrap min-w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--surface-alt)]/60 transition-colors">
                  <td className="p-3.5 min-w-[220px]">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover bg-[var(--surface)] border border-[var(--line)] shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <span className="font-serif font-medium text-[var(--ink)] truncate max-w-[180px]" title={p.name}>
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[var(--ink-soft)] whitespace-nowrap min-w-[130px]">
                    <span className="block text-[var(--ink)] font-bold">{p.sku}</span>
                    <span className="text-[10px] text-[var(--ink-soft)]/70">{p.category}</span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap min-w-[110px]">
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded whitespace-nowrap ${
                        p.inStock
                          ? 'bg-[var(--surface-alt)] text-[var(--primary)] border border-[var(--line)]'
                          : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      }`}
                    >
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-[var(--ink)] whitespace-nowrap min-w-[110px]">
                    PKR {p.retailPrice.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[var(--primary)] font-medium whitespace-nowrap min-w-[110px]">
                    PKR {p.partnerPrice.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[var(--accent)] font-bold whitespace-nowrap min-w-[110px]">
                    +PKR {p.grossMargin.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center whitespace-nowrap min-w-[120px]">
                    <Button
                      onClick={() => setSelectedProduct(p)}
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 hover:bg-[var(--surface-alt)] whitespace-nowrap shrink-0"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                  Submit Customer Order &amp; Proof
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  {selectedProduct.name} (SKU: {selectedProduct.sku})
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Customer WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Destination City *</label>
                  <input
                    type="text"
                    required
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    placeholder="e.g. Lahore / Rawalpindi"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Complete Shipping Address *</label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House #, Street #, Sector/Area, Landmark..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Payment Proof / Screenshot Upload */}
              <div className="space-y-1.5">
                <label className="block text-[var(--ink-soft)] font-medium">
                  Client Payment Proof / Screenshot *
                </label>
                <div className="p-3 rounded-xl bg-[var(--surface-alt)] border border-dashed border-[var(--line)] space-y-2 text-center">
                  {paymentScreenshotUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={paymentScreenshotUrl}
                        alt="Payment Proof"
                        className="max-h-36 max-w-full rounded-lg object-contain border border-[var(--line)] mx-auto bg-[var(--surface)]"
                      />
                      <button
                        type="button"
                        onClick={() => setPaymentScreenshotUrl('')}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700"
                        title="Remove image"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id="proofUpload"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="proofUpload"
                        className="cursor-pointer inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--primary)] hover:bg-[var(--surface-alt)] transition-colors font-medium text-xs shadow-2xs"
                      >
                        <span>Attach Payment Slip / Screenshot</span>
                      </label>
                      <p className="text-[10px] text-[var(--ink-soft)]/70 mt-1 font-mono">
                        Supports JPG, PNG, WebP (Bank Transfer / EasyPaisa / JazzCash receipt)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">
                  Transaction Notes / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentProofNotes}
                  onChange={(e) => setPaymentProofNotes(e.target.value)}
                  placeholder="e.g. Paid via EasyPaisa TRX 982183"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Instant Calculation Ledger Card */}
              <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[var(--ink-soft)]">
                  <span>Unit Wholesale Cost:</span>
                  <span>PKR {selectedProduct.partnerPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--ink-soft)]">
                  <span>Unit Retail Price:</span>
                  <span className="text-[var(--ink)]">PKR {selectedProduct.retailPrice.toLocaleString()}</span>
                </div>
                <div className="pt-1.5 border-t border-[var(--line)] flex justify-between font-bold text-[var(--accent)]">
                  <span>Total Margin Credit (Upon Delivery):</span>
                  <span>+PKR {(selectedProduct.grossMargin * quantity).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-medium">
                  Submit Order for Verification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Catalog Price Sheet Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 max-w-3xl w-full max-h-[calc(100dvh-2rem)] flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-serif font-medium text-base text-[var(--ink)]">
                  Wholesale Price Sheet Catalog
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  Official Partner Inventory &amp; Unit Margins Sheet
                </p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)]"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Table */}
            <div className="flex-1 overflow-y-auto overflow-x-auto pr-1">
              <table className="w-full min-w-[650px] text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink-soft)] font-mono text-[10px]">
                    <th className="p-2.5 whitespace-nowrap min-w-[90px]">SKU</th>
                    <th className="p-2.5 whitespace-nowrap min-w-[200px]">Product Name</th>
                    <th className="p-2.5 whitespace-nowrap min-w-[120px]">Category</th>
                    <th className="p-2.5 text-right whitespace-nowrap min-w-[100px]">Retail</th>
                    <th className="p-2.5 text-right whitespace-nowrap min-w-[100px]">Wholesale</th>
                    <th className="p-2.5 text-right whitespace-nowrap min-w-[110px]">Partner Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)] text-[11px]">
                  {allProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td className="p-2.5 font-mono text-[var(--ink-soft)] whitespace-nowrap min-w-[90px]">{prod.sku}</td>
                      <td className="p-2.5 font-serif font-medium text-[var(--ink)] whitespace-nowrap min-w-[200px]">{prod.name}</td>
                      <td className="p-2.5 text-[var(--ink-soft)] whitespace-nowrap min-w-[120px]">{prod.category}</td>
                      <td className="p-2.5 text-right font-mono text-[var(--ink)] whitespace-nowrap min-w-[100px]">PKR {prod.retailPrice}</td>
                      <td className="p-2.5 text-right font-mono text-[var(--primary)] whitespace-nowrap min-w-[100px]">PKR {prod.partnerPrice}</td>
                      <td className="p-2.5 text-right font-mono text-[var(--accent)] font-bold whitespace-nowrap min-w-[110px]">+{prod.grossMargin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--ink-soft)]/70">
                Generated from DreamToAchievers Wholesale Ledger
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                iconLeft={<Printer size={14} />}
              >
                Print Price Sheet
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
