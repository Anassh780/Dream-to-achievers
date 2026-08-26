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
      ).toLocaleString()} gross profit margin credited to your ledger.`
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
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl selection:bg-[#B8862E]/25">
      
      {/* 1. Header & Catalog Sheet Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCC8]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#5B5C50]">
            <span>Partner Hub</span>
            <span>/</span>
            <span>Wholesale Inventory</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1E241F] tracking-tight">
            Wholesale Products &amp; Margin Ledger
          </h1>
          <p className="text-xs text-[#5B5C50]">
            Browse verified wholesale SKUs, review unit profit margins, and record client sales orders.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            onClick={handleExportCatalog}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="text-xs font-medium"
            iconLeft={<FilePdf size={14} className="text-[#1F4D3E]" />}
          >
            {isExporting ? 'Preparing Sheet...' : 'Export Price Sheet PDF'}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-[#1F4D3E] text-xs flex items-center space-x-2 animate-in fade-in">
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
      <div className="p-3.5 rounded-xl bg-white border border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B5C50]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] placeholder:text-[#7C7D70] text-xs focus:outline-none focus:border-[#1F4D3E]"
          />
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1.5 text-[#5B5C50]">
            <SlidersHorizontal size={13} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
              className="px-2.5 py-1.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E] cursor-pointer"
            >
              <option value="highest_margin">Highest Margin (PKR)</option>
              <option value="lowest_margin">Lowest Margin</option>
              <option value="most_stock">In Stock First</option>
              <option value="recently_added">Recently Added</option>
            </select>
          </div>

          {/* Grid vs Table View Mode Toggle */}
          <div className="flex items-center rounded-lg bg-[#FAF7EF] p-0.5 border border-[#E3DCC8]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#1F4D3E] text-white' : 'text-[#5B5C50] hover:text-[#1E241F]'
              }`}
              title="Grid View"
            >
              <SquaresFour size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-[#1F4D3E] text-white' : 'text-[#5B5C50] hover:text-[#1E241F]'
              }`}
              title="Dense Table View"
            >
              <Rows size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Product Display Area (Grid View vs Table View) */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-[#E3DCC8] space-y-2 shadow-xs">
          <Package size={28} className="text-[#7C7D70] mx-auto" />
          <h3 className="font-serif font-medium text-[#1E241F] text-base">No Products Found</h3>
          <p className="text-xs text-[#5B5C50]">No inventory matched your search filter.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Discovery View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-xl bg-white border border-[#E3DCC8] overflow-hidden flex flex-col justify-between hover:border-[#D2C8AF] hover:shadow-md transition-all shadow-xs"
            >
              <div>
                <div className="aspect-[16/10] bg-[#FAF7EF] relative overflow-hidden border-b border-[#E3DCC8]">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-mono px-2 py-0.5 rounded bg-white/90 text-[#1E241F] border border-[#E3DCC8]">
                    {p.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5B5C50]">
                    <span>SKU: {p.sku}</span>
                    <span className={p.inStock ? 'text-[#1F4D3E] font-medium' : 'text-rose-600'}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>

                  <h3 className="font-serif font-medium text-[15px] text-[#1E241F] line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-[#5B5C50] line-clamp-2 leading-relaxed">
                    {p.shortDescription}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="p-2.5 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] space-y-1 text-xs">
                  <div className="flex justify-between text-[#5B5C50]">
                    <span>Retail Price:</span>
                    <span className="text-[#1E241F] font-mono">PKR {p.retailPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#5B5C50]">
                    <span>Wholesale Cost:</span>
                    <span className="text-[#1F4D3E] font-mono">PKR {p.partnerPrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-[#E3DCC8] flex justify-between font-medium">
                    <span className="text-[#1E241F]">Partner Margin:</span>
                    <span className="text-[#B8862E] font-mono font-bold">
                      +PKR {p.grossMargin.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedProduct(p)}
                  variant="primary"
                  size="sm"
                  className="w-full justify-center text-xs font-medium"
                  iconLeft={<ShoppingCart size={13} />}
                >
                  Record Client Sale
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Dense Operational Table View */
        <div className="rounded-xl bg-white border border-[#E3DCC8] overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#E3DCC8] bg-[#F1ECDD] text-[#5B5C50] font-mono text-[11px]">
                <th className="p-3.5">Product Details</th>
                <th className="p-3.5">SKU / Category</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5 text-right">Retail Price</th>
                <th className="p-3.5 text-right">Wholesale Cost</th>
                <th className="p-3.5 text-right">Gross Margin</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3DCC8]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF7EF] transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover bg-white border border-[#E3DCC8] shrink-0"
                      />
                      <span className="font-serif font-medium text-[#1E241F] truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[#5B5C50]">
                    <span className="block text-[#1E241F]">{p.sku}</span>
                    <span className="text-[10px] text-[#7C7D70]">{p.category}</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                        p.inStock
                          ? 'bg-[#F1ECDD] text-[#1F4D3E] border border-[#E3DCC8]'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono text-[#1E241F]">
                    PKR {p.retailPrice.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[#1F4D3E] font-medium">
                    PKR {p.partnerPrice.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-right font-mono text-[#B8862E] font-bold">
                    +PKR {p.grossMargin.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center">
                    <Button
                      onClick={() => setSelectedProduct(p)}
                      variant="outline"
                      size="sm"
                      className="text-xs px-3 py-1 hover:bg-[#F1ECDD]"
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
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-md w-full space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Record Customer Sale
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordSale} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5B5C50] mb-1 font-medium">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tariq Mehmood"
                  className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Customer Contact</label>
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="client@email.com"
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E]"
                  />
                </div>
                <div>
                  <label className="block text-[#5B5C50] mb-1 font-medium">Quantity Sold</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] focus:outline-none focus:border-[#1F4D3E] font-mono"
                  />
                </div>
              </div>

              {/* Instant Calculation Ledger Card */}
              <div className="p-3 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Unit Wholesale Cost:</span>
                  <span>PKR {selectedProduct.partnerPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#5B5C50]">
                  <span>Unit Retail Price:</span>
                  <span className="text-[#1E241F]">PKR {selectedProduct.retailPrice.toLocaleString()}</span>
                </div>
                <div className="pt-1.5 border-t border-[#E3DCC8] flex justify-between font-bold text-[#B8862E]">
                  <span>Total Calculated Profit:</span>
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
                  Confirm &amp; Credit Sale
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Catalog Price Sheet Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white border border-[#E3DCC8] p-6 max-w-3xl w-full max-h-[85vh] flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <div>
                <h3 className="font-serif font-medium text-base text-[#1E241F]">
                  Wholesale Price Sheet Catalog
                </h3>
                <p className="text-[11px] font-mono text-[#5B5C50]">
                  Official Partner Inventory &amp; Unit Margins Sheet
                </p>
              </div>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="p-1 rounded-lg text-[#5B5C50] hover:text-[#1E241F]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Table */}
            <div className="flex-1 overflow-y-auto pr-1">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-[#E3DCC8] bg-[#F1ECDD] text-[#5B5C50] font-mono text-[10px]">
                    <th className="p-2.5">SKU</th>
                    <th className="p-2.5">Product Name</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Retail</th>
                    <th className="p-2.5 text-right">Wholesale</th>
                    <th className="p-2.5 text-right">Partner Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3DCC8] text-[11px]">
                  {allProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td className="p-2.5 font-mono text-[#5B5C50]">{prod.sku}</td>
                      <td className="p-2.5 font-serif font-medium text-[#1E241F]">{prod.name}</td>
                      <td className="p-2.5 text-[#5B5C50]">{prod.category}</td>
                      <td className="p-2.5 text-right font-mono text-[#1E241F]">PKR {prod.retailPrice}</td>
                      <td className="p-2.5 text-right font-mono text-[#1F4D3E]">PKR {prod.partnerPrice}</td>
                      <td className="p-2.5 text-right font-mono text-[#B8862E] font-bold">+{prod.grossMargin}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-[#E3DCC8] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#7C7D70]">
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
