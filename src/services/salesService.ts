import { Sale, Product, SaleStatus } from '@/types';
import { storage } from './storage';
import { rankEngine } from './rankEngine';
import { notificationService } from './notificationService';
import { db, rtdb } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';

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
   * Retrieves all sales across the platform for administrators.
   */
  getAllSales(): Sale[] {
    const sales = storage.get<Sale[]>('SALES', []);
    return sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Returns count of qualifying confirmed/delivered sales for rank calculations.
   */
  getQualifyingSalesCount(userId: string): number {
    return this.getUserSales(userId).filter(
      (s) => s.isQualifying || s.status === 'delivered' || s.status === 'confirmed' || s.status === 'fulfilled'
    ).length;
  },

  /**
   * Computes total approved profit earned by user across all fulfilled/delivered sales.
   */
  getTotalProfitEarned(userId: string): number {
    return this.getUserSales(userId)
      .filter(
        (s) =>
          s.status === 'delivered' ||
          s.status === 'confirmed' ||
          s.status === 'fulfilled' ||
          s.isQualifying
      )
      .reduce((sum, s) => sum + s.profitMargin * s.quantity, 0);
  },

  /**
   * Computes profit currently locked in orders pending verification, processing, or in transit.
   */
  getPendingProfit(userId: string): number {
    return this.getUserSales(userId)
      .filter(
        (s) =>
          s.status === 'pending_verification' ||
          s.status === 'payment_verified' ||
          s.status === 'processing' ||
          s.status === 'dispatched' ||
          s.status === 'in_transit'
      )
      .reduce((sum, s) => sum + s.profitMargin * s.quantity, 0);
  },

  /**
   * Computes available profit balance ready for withdrawal (Approved Profit - Non-rejected Withdrawals).
   */
  getAvailableProfitBalance(userId: string): number {
    const approvedProfit = this.getTotalProfitEarned(userId);
    const withdrawals = storage.get<any[]>('WITHDRAWALS', []).filter(
      (w) => w.userId === userId && w.status !== 'rejected'
    );
    const lockedOrPaidWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    return Math.max(0, approvedProfit - lockedOrPaidWithdrawals);
  },

  /**
   * Computes total profit successfully paid out via withdrawals.
   */
  getWithdrawnProfit(userId: string): number {
    const withdrawals = storage.get<any[]>('WITHDRAWALS', []).filter(
      (w) => w.userId === userId && w.status === 'paid'
    );
    return withdrawals.reduce((sum, w) => sum + w.amount, 0);
  },

  /**
   * Records a new customer product sale with payment screenshot, WhatsApp, and delivery address.
   */
  async recordSale({
    userId,
    product,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    customerCity,
    paymentScreenshotUrl,
    paymentProofNotes,
    quantity = 1,
    sellingPrice,
  }: {
    userId: string;
    product: Product;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    customerCity?: string;
    paymentScreenshotUrl?: string;
    paymentProofNotes?: string;
    quantity?: number;
    sellingPrice?: number;
  }): Promise<{ success: boolean; sale?: Sale }> {
    const actualSellingPrice = sellingPrice || product.suggestedSellingPrice;
    const profitMargin = Math.max(0, actualSellingPrice - product.partnerPrice);

    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      productId: product.id,
      productName: product.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone?.trim(),
      customerEmail: customerEmail?.trim(),
      customerAddress: customerAddress?.trim(),
      customerCity: customerCity?.trim(),
      paymentScreenshotUrl,
      paymentProofNotes: paymentProofNotes?.trim(),
      quantity,
      retailPrice: product.retailPrice,
      partnerPrice: product.partnerPrice,
      sellingPrice: actualSellingPrice,
      profitMargin,
      currency: product.currency,
      status: 'pending_verification',
      isQualifying: false,
      createdAt: new Date().toISOString(),
    };

    const sales = storage.get<Sale[]>('SALES', []);
    sales.unshift(newSale);
    storage.set('SALES', sales);

    // Sync to Cloud
    try {
      await setDoc(doc(db, 'sales', newSale.id), newSale, { merge: true });
      await setDoc(doc(db, `users/${userId}/sales`, newSale.id), newSale, { merge: true });
    } catch (err) {
      console.warn('Firestore recordSale sync warning:', err);
    }
    try {
      await set(ref(rtdb, `sales/${newSale.id}`), newSale);
      await set(ref(rtdb, `user_sales/${userId}/${newSale.id}`), newSale);
    } catch (err) {
      console.warn('RTDB recordSale sync warning:', err);
    }

    // Create confirmation notification for seller with multi-cloud persistence
    notificationService.createNotification({
      userId,
      type: 'sale_submitted',
      title: '📦 Order Submitted for Verification',
      message: `Sale recorded for ${product.name} (Client: ${customerName}). Verification & dispatch in progress.`,
      linkUrl: '/dashboard/sales',
    });

    // Notify administrators about incoming client order
    notificationService.notifyAdmins({
      title: '📦 New Wholesale Order Recorded',
      message: `Order #${newSale.id} submitted for "${product.name}" (Qty: ${quantity}, Value: PKR ${(product.partnerPrice * quantity).toLocaleString()}). Client: ${customerName}.`,
      linkUrl: '/admin/sales',
      type: 'sale_submitted',
    }).catch(() => {});

    return { success: true, sale: newSale };
  },

  /**
   * Administrator updates order fulfillment, payment verification, proof slips, and shipping progress.
   */
  async updateSaleFulfillment({
    saleId,
    status,
    shippingCourier,
    trackingNumber,
    shippingNotes,
    adminReviewNote,
    adminPaymentProofUrl,
    adminProofNotes,
  }: {
    saleId: string;
    status: SaleStatus;
    shippingCourier?: string;
    trackingNumber?: string;
    shippingNotes?: string;
    adminReviewNote?: string;
    adminPaymentProofUrl?: string;
    adminProofNotes?: string;
  }): Promise<{ success: boolean }> {
    const sales = storage.get<Sale[]>('SALES', []);
    const idx = sales.findIndex((s) => s.id === saleId);
    if (idx === -1) return { success: false };

    const previousStatus = sales[idx].status;
    sales[idx].status = status;

    if (shippingCourier !== undefined) sales[idx].shippingCourier = shippingCourier;
    if (trackingNumber !== undefined) sales[idx].trackingNumber = trackingNumber;
    if (shippingNotes !== undefined) sales[idx].shippingNotes = shippingNotes;
    if (adminReviewNote !== undefined) sales[idx].adminReviewNote = adminReviewNote;
    if (adminPaymentProofUrl !== undefined) sales[idx].adminPaymentProofUrl = adminPaymentProofUrl;
    if (adminProofNotes !== undefined) sales[idx].adminProofNotes = adminProofNotes;

    const isDeliveredOrConfirmed = status === 'delivered' || status === 'confirmed' || status === 'fulfilled';
    if (isDeliveredOrConfirmed) {
      sales[idx].isQualifying = true;
      if (!sales[idx].deliveredAt) sales[idx].deliveredAt = new Date().toISOString();
      if (!sales[idx].confirmedAt) sales[idx].confirmedAt = new Date().toISOString();
    }

    storage.set('SALES', sales);

    // Sync to Cloud
    try {
      await setDoc(doc(db, 'sales', saleId), sales[idx], { merge: true });
      await setDoc(doc(db, `users/${sales[idx].userId}/sales`, saleId), sales[idx], { merge: true });
    } catch (err) {
      console.warn('Firestore updateSaleStatus sync warning:', err);
    }
    try {
      await set(ref(rtdb, `sales/${saleId}`), sales[idx]);
      await set(ref(rtdb, `user_sales/${sales[idx].userId}/${saleId}`), sales[idx]);
    } catch (err) {
      console.warn('RTDB updateSaleStatus sync warning:', err);
    }

    // Check rank promotion if delivered
    if (isDeliveredOrConfirmed) {
      rankEngine.checkAndPromoteUser(sales[idx].userId);
    }

    // Create notification for seller with cloud Firestore & RTDB sync
    const targetUserId = sales[idx].userId;
    const notifTitles: Record<string, string> = {
      payment_verified: '✅ Client Payment Verified',
      processing: '📦 Order Processing in Warehouse',
      dispatched: '🚚 Order Dispatched with Courier',
      in_transit: '🛣️ Order In Transit for Delivery',
      delivered: '🎉 Order Delivered! Profit Credited',
      rejected: '❌ Order Payment Rejected',
      cancelled: '⚠️ Order Cancelled',
    };

    notificationService.createNotification({
      userId: targetUserId,
      type: status === 'delivered' ? 'sale_delivered' : status === 'dispatched' ? 'sale_dispatched' : 'sale_confirmed',
      title: notifTitles[status] || 'Order Status Updated',
      message:
        status === 'delivered'
          ? `Order #${sales[idx].id} for ${sales[idx].productName} was marked as Delivered! PKR ${(sales[idx].profitMargin * sales[idx].quantity).toLocaleString()} profit margin has been released to your Available Balance.`
          : status === 'dispatched'
          ? `Order #${sales[idx].id} for ${sales[idx].productName} has been dispatched via ${shippingCourier || 'Courier'} (Tracking: ${trackingNumber || 'Available in ledger'}).`
          : status === 'rejected'
          ? `Order #${sales[idx].id} for ${sales[idx].productName} was rejected: ${adminReviewNote || 'Payment receipt could not be verified'}. Please upload a valid payment receipt or contact support.`
          : `Order #${sales[idx].id} for ${sales[idx].productName} status updated to ${status.replace('_', ' ')}.`,
      linkUrl: '/dashboard/sales',
    });

    return { success: true };
  },
};
