import React, { useState, useEffect, useMemo } from 'react';
import { storage } from '@/services/storage';
import { auditService } from '@/services/auditService';
import { categoryService } from '@/services/categoryService';
import { useAuth } from '@/context/AuthContext';
import { Category, Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/context/ToastContext';
import { cloudSyncService } from '@/services/cloudSyncService';
import { uploadProductImage, isValidImageUrl } from '@/services/imageService';
import {
  Plus,
  Trash,
  X,
  PencilSimple,
  Package,
  Check,
  MagnifyingGlass,
  ArrowCounterClockwise,
  CheckSquare,
  Square,
  Sparkle,
  Link as LinkIcon,
  UploadSimple,
  Image as ImageIcon,
  CloudCheck,
  ArrowClockwise,
} from '@phosphor-icons/react';

export const AdminProductsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>(() =>
    storage.get<Product[]>('PRODUCTS', [])
  );
  const [allCategories, setAllCategories] = useState<Category[]>(() =>
    categoryService.getAllCategories()
  );

  useEffect(() => {
    const handleProductsUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      } else {
        setProducts(storage.get<Product[]>('PRODUCTS', []));
      }
    };
    window.addEventListener('dta_products_update', handleProductsUpdate);
    window.addEventListener('dta_storage_change', handleProductsUpdate);
    return () => {
      window.removeEventListener('dta_products_update', handleProductsUpdate);
      window.removeEventListener('dta_storage_change', handleProductsUpdate);
    };
  }, []);

  useEffect(() => {
    const refreshCategories = (event?: Event) => {
      const detail = (event as CustomEvent<{ key?: string }>)?.detail;
      if (!detail?.key || detail.key === 'CATEGORIES') {
        setAllCategories(categoryService.getAllCategories());
      }
    };
    refreshCategories();
    window.addEventListener('dta_storage_change', refreshCategories);
    return () => window.removeEventListener('dta_storage_change', refreshCategories);
  }, []);

  const [isCreating, setIsCreating] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selective Restore Modal States
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedRestoreIds, setSelectedRestoreIds] = useState<string[]>([]);
  const [restoreSearch, setRestoreSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>(allCategories[0]?.id || 'cat-skincare');
  const [retailPrice, setRetailPrice] = useState(2500);
  const [partnerPrice, setPartnerPrice] = useState(2000);
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
  );
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (allCategories.length > 0 && !allCategories.some((category) => category.id === categoryId)) {
      setCategoryId(allCategories[0].id);
    }
  }, [allCategories, categoryId]);

  const { success: toastSuccess, error: toastError } = useToast();
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  const showToast = (msg: string) => {
    if (msg.toLowerCase().includes('fail') || msg.toLowerCase().includes('error') || msg.toLowerCase().includes('expire')) {
      toastError(msg);
    } else {
      toastSuccess(msg);
    }
  };

  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const handleForceCloudSync = async () => {
    setIsCloudSyncing(true);
    try {
      const count = await cloudSyncService.syncAllProductsToCloud(products);
      showToast(`⚡ Successfully synchronized ${count} products to Firebase Cloud & all devices!`);
    } catch {
      showToast('Firebase sync failed. Check your connection and try again.');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingProd(null);
    setName('');
    setSku(`DTA-${Math.floor(1000 + Math.random() * 9000)}`);
    setCategoryId(allCategories[0]?.id || 'cat-skincare');
    setRetailPrice(2500);
    setPartnerPrice(2000);
    setImageUrl('https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80');
    setImageInputMode('url');
    setShortDescription('');
    setDescription('');
    setInStock(true);
    setIsFeatured(false);
    setIsCreating(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProd(p);
    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.categoryId || allCategories[0]?.id || 'cat-skincare');
    setRetailPrice(p.retailPrice);
    setPartnerPrice(p.partnerPrice);
    setImageUrl(p.imageUrl);
    setImageInputMode(p.imageUrl?.startsWith('data:') ? 'upload' : 'url');
    setShortDescription(p.shortDescription);
    setDescription(p.description);
    setInStock(p.inStock);
    setIsFeatured(p.isFeatured || false);
    setIsCreating(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!currentAdmin) {
      showToast('Your admin session has expired. Please sign in again.');
      return;
    }
    const adminUser = currentAdmin;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const targetCat = allCategories.find((c) => c.id === categoryId);
    const categoryName = targetCat ? targetCat.name : 'General';
    const grossMargin = Math.max(0, retailPrice - partnerPrice);

    if (editingProd) {
      const updatedProdObj: Product = {
        ...editingProd,
        name: name.trim(),
        slug,
        category: categoryName,
        categoryId,
        retailPrice: Number(retailPrice),
        partnerPrice: Number(partnerPrice),
        suggestedSellingPrice: Number(retailPrice),
        grossMargin,
        sku: sku.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        inStock,
        isFeatured,
      };

      const updated: Product[] = products.map((p) =>
        p.id === editingProd.id ? updatedProdObj : p
      );

      storage.set('PRODUCTS', updated);
      setProducts(updated);
      await cloudSyncService.syncProductToCloud(updatedProdObj);

      auditService.logAction({
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'UPDATE_PRODUCT',
        entityType: 'product',
        entityId: editingProd.id,
        details: `Updated product "${name}" (SKU: ${sku})`,
      });

      showToast(`Product "${name}" updated and synced across all devices.`);
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: name.trim(),
        slug,
        category: categoryName,
        categoryId,
        retailPrice: Number(retailPrice),
        partnerPrice: Number(partnerPrice),
        suggestedSellingPrice: Number(retailPrice),
        grossMargin,
        currency: 'PKR',
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
        sku: sku.trim(),
        inStock,
        isFeatured,
        status: 'active',
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
      };

      const updated = [newProduct, ...products];
      storage.set('PRODUCTS', updated);
      setProducts(updated);
      await cloudSyncService.syncProductToCloud(newProduct);

      auditService.logAction({
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        action: 'CREATE_PRODUCT',
        entityType: 'product',
        entityId: newProduct.id,
        details: `Created product "${name}" (SKU: ${sku})`,
      });

      showToast(`Product "${name}" created and synced across all devices.`);
    }

    setIsCreating(false);
  };

  const handleDelete = (p: Product) => {
    if (!currentAdmin) return;
    setProductToDelete(p);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete || !currentAdmin) return;
    const p = productToDelete;
    setIsDeletingProduct(true);
    const updated = products.filter((item) => item.id !== p.id);
    storage.set('PRODUCTS', updated);
    setProducts(updated);

    const archived = storage.get<Product[]>('DELETED_PRODUCTS', []);
    if (!archived.some((item) => item.id === p.id)) {
      storage.set('DELETED_PRODUCTS', [p, ...archived]);
    }

    cloudSyncService.archiveProduct(p).catch(() => {
      showToast('Firebase could not archive this product. Please try again.');
    });

    auditService.logAction({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      action: 'DELETE_PRODUCT',
      entityType: 'product',
      entityId: p.id,
      details: `Deleted product "${p.name}" (SKU: ${p.sku})`,
    });

    setIsDeletingProduct(false);
    setProductToDelete(null);
    showToast(`Product "${p.name}" moved to deleted archive.`);
  };

  const recoverableProducts = useMemo(() => {
    const archived = storage.get<Product[]>('DELETED_PRODUCTS', []);
    return archived;
  }, [products, isRestoreModalOpen]);

  const filteredRecoverable = useMemo(() => {
    if (!restoreSearch.trim()) return recoverableProducts;
    const q = restoreSearch.toLowerCase();
    return recoverableProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [recoverableProducts, restoreSearch]);

  const handleOpenRestoreModal = () => {
    setSelectedRestoreIds(recoverableProducts.map((p) => p.id));
    setRestoreSearch('');
    setIsRestoreModalOpen(true);
  };

  const handleToggleSelectRestore = (id: string) => {
    setSelectedRestoreIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllRestore = () => {
    if (selectedRestoreIds.length === filteredRecoverable.length) {
      setSelectedRestoreIds([]);
    } else {
      setSelectedRestoreIds(filteredRecoverable.map((p) => p.id));
    }
  };

  const handleConfirmSelectiveRestore = () => {
    if (selectedRestoreIds.length === 0) return;
    const itemsToRestore = recoverableProducts.filter((p) => selectedRestoreIds.includes(p.id));
    const updatedProducts = [...itemsToRestore, ...products];
    storage.set('PRODUCTS', updatedProducts);
    setProducts(updatedProducts);

    // Sync each restored item to cloud
    itemsToRestore.forEach((item) => {
      cloudSyncService.restoreProduct(item);
    });

    const remainingArchive = storage
      .get<Product[]>('DELETED_PRODUCTS', [])
      .filter((p) => !selectedRestoreIds.includes(p.id));
    storage.set('DELETED_PRODUCTS', remainingArchive);

    setIsRestoreModalOpen(false);
    showToast(`Restored ${itemsToRestore.length} products to active catalog.`);
  };

  const filteredList = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        categoryFilter === 'all' ||
        p.category === categoryFilter ||
        p.categoryId === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6 font-sans max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#9EABA2]">
            <span className="funding-ghost-pill px-2.5 py-0.5 text-[10px] text-[#D9C08A] border-[#D9C08A]/30">Store Admin</span>
            <span>/</span>
            <span>Products &amp; Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight">
            Products &amp; Wholesale Catalog
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleForceCloudSync}
            disabled={isCloudSyncing}
            className="funding-ghost-pill px-3.5 py-2 text-xs font-medium text-[#F4F7F5] hover:border-white/20 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all flex-1 sm:flex-initial justify-center"
          >
            <Sparkle size={14} className={isCloudSyncing ? 'animate-spin' : 'text-[#D9C08A]'} />
            <span>{isCloudSyncing ? 'Syncing...' : 'Sync catalog'}</span>
          </button>
          <button
            onClick={handleOpenRestoreModal}
            className="funding-ghost-pill px-3.5 py-2 text-xs font-medium text-[#9EABA2] hover:text-[#F4F7F5] hover:border-white/20 inline-flex items-center gap-1.5 cursor-pointer transition-all flex-1 sm:flex-initial justify-center"
          >
            <ArrowCounterClockwise size={14} />
            <span>Restore ({recoverableProducts.length})</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="funding-champagne-sheen-btn px-5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-md cursor-pointer flex-1 sm:flex-initial justify-center"
          >
            <Plus size={14} weight="bold" />
            <span>Add product</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group">
          <span className="text-xs text-[#9EABA2] font-mono block">Listed Products</span>
          <span className="text-2xl font-bold font-mono text-[#F4F7F5] block">{products.length}</span>
          <span className="text-[10px] text-[#9EABA2] font-mono block">Active Catalog SKUs</span>
        </div>
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#34D399]/30 hover:border-[#34D399]/50">
          <span className="text-xs text-[#34D399] font-mono font-medium block">In Stock &amp; Available</span>
          <span className="text-2xl font-bold font-mono text-[#34D399] block">
            {products.filter((p) => p.inStock).length}
          </span>
          <span className="text-[10px] text-[#9EABA2] font-mono block">Ready for immediate dispatch</span>
        </div>
        <div className="funding-stat-kpi p-5 sm:p-6 space-y-1 relative overflow-hidden group border-[#D9C08A]/30 hover:border-[#D9C08A]/50">
          <span className="text-xs text-[#D9C08A] font-mono font-medium block">Featured Highlights</span>
          <span className="text-2xl font-bold font-mono text-[#D9C08A] block">
            {products.filter((p) => p.isFeatured).length}
          </span>
          <span className="text-[10px] text-[#9EABA2] font-mono block">Promoted on public showcases</span>
        </div>
      </div>

      {/* 2. Search & Category Filter Toolbar */}
      <div className="funding-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:max-w-xs">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9EABA2]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/70 text-xs focus:outline-none focus:border-[#D9C08A] focus:ring-1 focus:ring-[#D9C08A]/30 transition-colors"
          />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 w-full sm:w-auto sm:flex sm:justify-end">
          <span className="text-xs text-[#9EABA2] font-mono hidden sm:inline">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[#F4F7F5] text-xs focus:outline-none focus:border-[#D9C08A] cursor-pointer"
          >
            <option value="all" className="bg-[#070B09] text-[#F4F7F5]">All Categories ({products.length})</option>
            {allCategories.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#070B09] text-[#F4F7F5]">
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-[11px] font-mono text-[#D9C08A] funding-ghost-pill px-2.5 py-1">
            {filteredList.length} SKUs
          </span>
        </div>
      </div>

      {/* 3. Operational Data Table */}
      <div className="sm:hidden space-y-3" aria-label="Product inventory">
        {filteredList.map((prod) => (
          <article key={prod.id} className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <img
                src={prod.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                alt={prod.name}
                className="size-16 rounded-xl object-cover bg-[var(--surface)] border border-[var(--line)] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-sm text-[var(--ink)] leading-snug">{prod.name}</h2>
                <p className="mt-1 text-[10px] font-mono text-[var(--ink-soft)] truncate">{prod.sku} · {prod.category}</p>
                <span className={`mt-2 inline-flex text-[10px] font-mono font-medium px-2 py-1 rounded-lg border ${
                  prod.inStock ? 'bg-[var(--surface-alt)] text-[var(--primary-dark)] border-[var(--line)]' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                }`}>
                  {prod.inStock ? 'In stock' : 'Out of stock'}
                </span>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] p-3 text-center">
              <div><dt className="text-[9px] text-[var(--ink-soft)]">Retail</dt><dd className="text-[11px] font-mono font-semibold">PKR {prod.retailPrice.toLocaleString()}</dd></div>
              <div><dt className="text-[9px] text-[var(--ink-soft)]">Cost</dt><dd className="text-[11px] font-mono font-semibold text-[var(--primary-dark)]">PKR {prod.partnerPrice.toLocaleString()}</dd></div>
              <div><dt className="text-[9px] text-[var(--ink-soft)]">Margin</dt><dd className="text-[11px] font-mono font-bold text-[var(--accent)]">+{prod.grossMargin.toLocaleString()}</dd></div>
            </dl>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" className="w-full" iconLeft={<PencilSimple size={14} />} onClick={() => handleOpenEdit(prod)}>Edit</Button>
              <Button type="button" variant="danger" size="sm" className="w-full" iconLeft={<Trash size={14} />} onClick={() => handleDelete(prod)}>Delete</Button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden sm:block rounded-xl bg-[var(--surface)] border border-[var(--line)] overflow-x-auto touch-pan-x overscroll-x-contain shadow-xs w-full">
        <table className="w-full min-w-[950px] text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink-soft)] font-mono text-[11px]">
              <th className="p-3.5 min-w-[240px]">Product</th>
              <th className="p-3.5 min-w-[150px] whitespace-nowrap">SKU &amp; Category</th>
              <th className="p-3.5 min-w-[110px] whitespace-nowrap">Stock</th>
              <th className="p-3.5 text-right min-w-[120px] whitespace-nowrap">Retail Price</th>
              <th className="p-3.5 text-right min-w-[120px] whitespace-nowrap">Wholesale Cost</th>
              <th className="p-3.5 text-right min-w-[130px] whitespace-nowrap">Partner Margin</th>
              <th className="p-3.5 text-center min-w-[100px] whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {filteredList.map((prod) => (
              <tr key={prod.id} className="hover:bg-[var(--surface-alt)]/60 transition-colors">
                <td className="p-3.5">
                  <div className="flex items-center space-x-3">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-9 h-9 rounded-lg object-cover bg-[var(--surface)] border border-[var(--line)] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--ink)] truncate max-w-[220px]">{prod.name}</p>
                      {prod.isFeatured && (
                        <span className="text-[9px] font-mono font-bold text-[var(--primary)] uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3.5 font-mono text-[var(--ink-soft)] whitespace-nowrap">
                  <div>{prod.sku}</div>
                  <div className="text-[10px] text-[var(--ink-soft)]/70">{prod.category}</div>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium ${
                      prod.inStock
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {prod.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="p-3.5 text-right font-mono font-medium text-[var(--ink)] whitespace-nowrap">
                  PKR {prod.retailPrice.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono text-[var(--ink-soft)] whitespace-nowrap">
                  PKR {prod.partnerPrice.toLocaleString()}
                </td>
                <td className="p-3.5 text-right font-mono font-bold text-[var(--accent)] whitespace-nowrap">
                  +PKR {prod.grossMargin.toLocaleString()}
                </td>
                <td className="p-3.5 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)]"
                      title="Edit Product"
                    >
                      <PencilSimple size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(prod)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                      title="Delete Product"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Product Modal Drawer */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="rounded-t-3xl sm:rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-4 sm:p-6 max-w-xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto space-y-4 shadow-xl pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-6 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            <div className="sticky top-0 z-10 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-6 py-4 flex items-start justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)]">
              <div>
                <h3 id="product-dialog-title" className="font-serif font-medium text-lg text-[var(--ink)]">
                  {editingProd ? 'Edit Product SKU' : 'Add New Wholesale Product'}
                </h3>
                <p className="text-[11px] font-mono text-[var(--ink-soft)]">
                  Configure commercial specs &amp; unit margins
                </p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="size-11 shrink-0 inline-flex items-center justify-center rounded-xl text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] active:scale-[0.96] transition-transform"
                aria-label="Close product editor"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Organic Rose Hydrating Mist"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="DTA-1049"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="product-category" className="block text-[var(--ink-soft)] mb-1 font-medium">Category Assignment *</label>
                <select
                  id="product-category"
                  required
                  disabled={allCategories.length === 0}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                >
                  {allCategories.length === 0 && <option value="">No categories available</option>}
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {allCategories.length === 0 && (
                  <p className="mt-2 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 p-2.5 text-[11px] leading-relaxed text-[var(--ink)]">
                    Create a category before adding products. <a href="/admin/categories" className="font-semibold underline underline-offset-2">Open Category Management</a>
                  </p>
                )}
              </div>

              {/* Product Image Dual-Option Selector */}
              <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-[var(--primary-dark)]" />
                    Product Image Selection (Syncs to All Devices)
                  </span>
                  
                  {/* Mode Tabs */}
                  <div className="grid grid-cols-2 w-full sm:w-auto bg-[var(--surface)] p-0.5 rounded-lg border border-[var(--line)] text-xs">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`min-w-0 px-2.5 py-1 rounded-md transition-colors flex items-center justify-center gap-1 font-medium ${
                        imageInputMode === 'url'
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <LinkIcon size={13} />
                      <span>Image URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`min-w-0 px-2.5 py-1 rounded-md transition-colors flex items-center justify-center gap-1 font-medium ${
                        imageInputMode === 'upload'
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                      }`}
                    >
                      <UploadSimple size={13} />
                      <span>Upload file</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Left: Input controls */}
                  <div className="md:col-span-8 space-y-2">
                    {imageInputMode === 'url' ? (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-[var(--ink-soft)] font-mono">
                          Direct Image Web Link (HTTPS from Unsplash, Imgur, Cloudinary, etc.):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="flex-1 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-xs focus:outline-none focus:border-[var(--primary)]"
                          />
                          {imageUrl && (
                            <button
                              type="button"
                              onClick={() => setImageUrl('')}
                              className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink-soft)] hover:text-rose-600 hover:bg-rose-500/10"
                              title="Clear URL"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-[var(--ink-soft)]">
                          Paste any publicly accessible image link. It will render on all partner and public devices.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] text-[var(--ink-soft)] font-mono">
                          Select Image File from your Phone or Computer (Auto-Compressed):
                        </label>
                        <div className="flex items-center gap-2">
                          <label
                            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 border-dashed border-[var(--primary)]/30 bg-[var(--surface)] hover:bg-[var(--surface-alt)]/50 text-[var(--ink)] text-xs cursor-pointer transition-all ${
                              isUploadingImage ? 'opacity-60 pointer-events-none' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <UploadSimple size={18} className="text-[var(--primary-dark)]" />
                              <span className="font-medium">
                                {isUploadingImage ? 'Optimizing & Uploading...' : 'Click to Browse Image File (JPG, PNG, WebP)'}
                              </span>
                            </div>
                            <span className="text-[10px] text-[var(--ink-soft)] mt-0.5">
                              Automatic smart compression creates a high-res, lightweight asset synced to all databases.
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={isUploadingImage}
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setIsUploadingImage(true);
                                  try {
                                    const optimizedUrl = await uploadProductImage(
                                      file,
                                      editingProd?.id || `prod-${Date.now()}`
                                    );
                                    setImageUrl(optimizedUrl);
                                    showToast('⚡ Picture compressed and ready to sync across all devices!');
                                  } catch (err) {
                                    console.error('Image upload failed:', err);
                                    showToast('Image processing failed. Please try a different image.');
                                  } finally {
                                    setIsUploadingImage(false);
                                  }
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Live Preview Box */}
                  <div className="md:col-span-4 flex items-center justify-center p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--line)] bg-[var(--surface)] shrink-0 group">
                      <img
                        src={imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
                        alt="Product Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-mono">
                        Live Preview
                      </div>
                    </div>
                    <div className="ml-3 text-left">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary-dark)] border border-[var(--primary)]/20 inline-block mb-1">
                        {imageUrl?.startsWith('data:') ? 'Compressed Asset' : 'Web URL Asset'}
                      </span>
                      <p className="text-[10px] text-[var(--ink-soft)] line-clamp-2">
                        {imageUrl ? 'Ready for Realtime Cloud Sync' : 'No image loaded'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Retail Price (PKR)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Wholesale Cost (PKR)</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={partnerPrice}
                    onChange={(e) => setPartnerPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--ink-soft)] mb-1 font-medium">Gross Margin (PKR)</label>
                  <input
                    type="text"
                    disabled
                    value={`+PKR ${Math.max(0, retailPrice - partnerPrice).toLocaleString()}`}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--accent)] font-mono font-bold cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Short One-Line Summary</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Key highlight or ingredient benefits"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink-soft)] mb-1 font-medium">Full Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product information..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center space-x-2 text-xs text-[var(--ink-soft)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="rounded accent-[var(--primary)]"
                  />
                  <span>In Stock Availability</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-[var(--ink-soft)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded accent-[var(--primary)]"
                  />
                  <span>Featured in Catalog</span>
                </label>
              </div>

              <div className="sticky bottom-0 z-10 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-4 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-sm grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={allCategories.length === 0} className="w-full font-medium">
                  {editingProd ? 'Save Changes' : 'Create Product SKU'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Selective Restore Deleted Products Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain">
          <div className="w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl overflow-hidden text-xs pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-0 overscroll-contain animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 ease-out">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--line)] flex items-center justify-between bg-[var(--surface)]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-xs">
                  <ArrowCounterClockwise size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--ink)]">
                    Restore Deleted / Archived Products
                  </h3>
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    Select specific products to recover back into the active catalog.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--surface-alt)] active:scale-[0.96] transition-transform"
                aria-label="Close restore dialog"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search & Selection Actions Bar */}
            <div className="p-4 border-b border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--surface)]">
              <div className="relative w-full sm:w-72">
                <MagnifyingGlass size={14} className="absolute left-3 top-2.5 text-[var(--ink-soft)]" />
                <input
                  type="text"
                  placeholder="Search deleted products..."
                  value={restoreSearch}
                  onChange={(e) => setRestoreSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={handleSelectAllRestore}
                  className="text-[11px] font-mono font-semibold text-[var(--primary-dark)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {selectedRestoreIds.length === filteredRecoverable.length ? (
                    <>
                      <CheckSquare size={15} weight="fill" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square size={15} />
                      <span>Select All ({filteredRecoverable.length})</span>
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* Recoverable Product Cards List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5 divide-y divide-[var(--line)]">
              {filteredRecoverable.length === 0 ? (
                <div className="p-8 text-center text-[var(--ink-soft)] space-y-2">
                  <Package size={32} className="text-[var(--ink-soft)] mx-auto" />
                  <p className="font-bold text-sm text-[var(--ink)]">No deleted or archived products found</p>
                  <p className="text-xs text-[var(--ink-soft)]">
                    Deleted products will appear here until they are restored.
                  </p>
                </div>
              ) : (
                filteredRecoverable.map((p) => {
                  const isSelected = selectedRestoreIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleSelectRestore(p.id)}
                      className={`pt-2.5 first:pt-0 flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--surface)] border-[var(--primary)]/40 shadow-xs'
                          : 'bg-[var(--surface)] border-[var(--line)] hover:bg-[var(--surface)]/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRestore(p.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded accent-[var(--primary)] cursor-pointer shrink-0"
                        />
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[var(--line)] bg-[var(--surface)] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--ink)] text-xs truncate">{p.name}</p>
                          <div className="flex items-center space-x-2 text-[10px] font-mono text-[var(--ink-soft)] mt-0.5">
                            <span className="bg-[var(--surface)] px-1.5 py-0.2 rounded border border-[var(--line)]">{p.sku}</span>
                            <span>•</span>
                            <span className="text-[var(--primary-dark)]">{p.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono space-y-0.5 ml-3">
                        <span className="font-bold text-[var(--ink)] text-xs block">
                          PKR {p.retailPrice.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[var(--accent)] font-semibold block">
                          Margin: +PKR {p.grossMargin.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--line)] bg-[var(--surface)] flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--ink-soft)]">
                Selected: <strong className="text-[var(--primary-dark)]">{selectedRestoreIds.length}</strong> items
              </span>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRestoreModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmSelectiveRestore}
                  disabled={selectedRestoreIds.length === 0}
                  className="bg-[var(--primary)] text-white"
                >
                  Restore Selected ({selectedRestoreIds.length})
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Accessible Confirmation Dialog for Product Deletion */}
      <ConfirmDialog
        isOpen={!!productToDelete}
        title={`Archive Product "${productToDelete?.name || ''}"`}
        description={`Are you sure you want to delete ${productToDelete?.name || 'this product'}? You can restore it anytime from the Restore Products archive.`}
        confirmLabel="Archive Product"
        cancelLabel="Keep in Catalog"
        variant="danger"
        isLoading={isDeletingProduct}
        onConfirm={handleConfirmDeleteProduct}
        onClose={() => setProductToDelete(null)}
      />

    </div>
  );
};
