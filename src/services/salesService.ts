import { Sale, Product } from '@/types';
import { storage } from './storage';
import { rankEngine } from './rankEngine';

export const salesService = {
  /**
   * Retrieves all sales for a user.
   */
  getUserSales(userId: string): Sale[] {
    const sales = storage.get<Sale[]>('SALES', []);
    return sales
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Returns count of qualifying confirmed sales for rank calculations.
   */
  getQualifyingSalesCount(userId: string): number {
    return this.getUserSales(userId).filter((s) => s.isQualifying).length;
  },

  /**
   * Computes total profit margin earned by user across all confirmed sales.
   */
  getTotalProfitEarned(userId: string): number {
    return this.getUserSales(userId)
      .filter((s) => s.status === 'confirmed' || s.status === 'fulfilled')
      .reduce((sum, s) => sum + s.profitMargin * s.quantity, 0);
  },

  /**
   * Records a new customer product sale.
   */
  recordSale({
    userId,
    product,
    customerName,
    customerEmail,
    quantity = 1,
    sellingPrice,
  }: {
    userId: string;
    product: Product;
    customerName: string;
    customerEmail?: string;
    quantity?: number;
    sellingPrice?: number;
  }): { success: boolean; sale?: Sale } {
    const actualSellingPrice = sellingPrice || product.suggestedSellingPrice;
    const profitMargin = Math.max(0, actualSellingPrice - product.partnerPrice);

    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      productId: product.id,
      productName: product.name,
      customerName: customerName.trim(),
      customerEmail: customerEmail?.trim(),
      quantity,
      retailPrice: product.retailPrice,
      partnerPrice: product.partnerPrice,
      sellingPrice: actualSellingPrice,
      profitMargin,
      currency: product.currency,
      status: 'confirmed',
      isQualifying: true,
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };

    const sales = storage.get<Sale[]>('SALES', []);
    sales.unshift(newSale);
    storage.set('SALES', sales);

    // Create notification
    const notifs = storage.get<any[]>('NOTIFICATIONS', []);
    notifs.unshift({
      id: `notif-${Date.now()}`,
      userId,
      type: 'sale_confirmed',
      title: '📦 New Product Sale Recorded!',
      message: `Sale confirmed for ${product.name} (+${product.currency} ${(profitMargin * quantity).toLocaleString()} margin).`,
      isRead: false,
      linkUrl: '/dashboard/sales',
      createdAt: new Date().toISOString(),
    });
    storage.set('NOTIFICATIONS', notifs);

    // Check rank promotion
    rankEngine.checkAndPromoteUser(userId);

    return { success: true, sale: newSale };
  },
};
