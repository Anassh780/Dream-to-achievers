import {
  SettlementRecord,
  SettlementTemplateType,
  SettlementCurrency,
  SettlementStatus,
  PayoutChannel,
  PartnerTier,
  computeRecordHash,
} from '@/types/settlement';
import { WithdrawalRequest, Reward } from '@/types';
import { storage } from './storage';

const STORAGE_KEY = 'SETTLEMENT_CERTIFICATES';

export const settlementService = {
  /**
   * Generates sample/demonstration settlement record for drafting and previewing.
   * Default template is the Funding Pips VIP luxury edition.
   */
  createSampleRecord(): SettlementRecord {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: `FP-VIP-${Date.now().toString(36).toUpperCase()}`,
      mode: 'verified',
      businessName: 'Ghhhhbbhjn',
      signatoryName: 'Ghhhhbbhjn',
      recipientName: 'Ghhhhbbhjn',
      partnerId: 'DTA-VIP-9842',
      amount: 15000.0,
      currency: 'PKR',
      totalProductsSold: 18,
      cumulativeSettlements: 45000.0,
      partnerTier: 'Diamond VIP Partner',
      settlementDate: today,
      settlementTime: '14:30:00 UTC',
      utrReference: `UTR-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      payoutChannel: 'Easypaisa / JazzCash Business',
      status: 'Settled',
      platformName: 'Dream to Achievers Financial Node',
      platformLogoUrl: undefined,
      partnerLogoUrl: undefined,
      endorsementNote: 'Executive Revenue Share & VIP Performance Milestone Disbursement',
      complianceHash: '7F9A2B4C8D0E1F3A5B7C9D1E3F5A7B9C1D3E5F7A9B1C3D5E7F9A1B3C5D7E9F1A',
      template: 'funding_pips_portrait',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Converts an authentic WithdrawalRequest into a verified VIP settlement certificate.
   * Automatically calculates total products sold by the user from stored sales.
   */
  async createRecordFromWithdrawal(
    w: WithdrawalRequest,
    options?: {
      businessName?: string;
      signatoryName?: string;
      recipientName?: string;
      partnerTier?: string;
      totalProductsSold?: number;
      cumulativeSettlements?: number;
      template?: SettlementTemplateType;
    }
  ): Promise<SettlementRecord> {
    const dateStr = w.processedAt || w.requestedAt;
    const cleanDate = dateStr ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const cleanTime = dateStr ? new Date(dateStr).toTimeString().slice(0, 8) + ' UTC' : '12:00:00 UTC';

    const utr = w.transactionReference || `TXN-${w.id.replace('wd-', '').toUpperCase()}`;
    const business = options?.businessName || w.payoutMethod?.accountTitle || w.userName || 'Verified Partner';
    const signatory = options?.signatoryName || w.userName || 'Authorized Signatory';
    const recipient = options?.recipientName || w.userName || w.payoutMethod?.accountTitle || 'Distinguished Reseller';
    const tier = options?.partnerTier || 'Diamond VIP Partner';

    // Auto-calculate user total products sold
    let totalProducts = options?.totalProductsSold;
    if (totalProducts === undefined) {
      try {
        const sales = storage.get<any[]>('SALES', []);
        const userSales = sales.filter((s: any) => s.userId === w.userId);
        const count = userSales
          .filter((s: any) => s.status !== 'cancelled' && s.status !== 'rejected')
          .reduce((sum: number, s: any) => sum + (Number(s.quantity) || 1), 0);
        totalProducts = count > 0 ? count : (userSales.length > 0 ? userSales.length : 1);
      } catch {
        totalProducts = 1;
      }
    }

    const statusMap: Record<string, SettlementStatus> = {
      paid: 'Settled',
      approved: 'Disbursed',
      pending: 'Processed',
      rejected: 'Pending Re-check',
    };
    const settlementStatus: SettlementStatus = statusMap[w.status] || 'Settled';

    let channel: PayoutChannel = 'Easypaisa / JazzCash Business';
    if (w.payoutMethod?.methodType === 'bank_transfer') {
      channel = '1-Link IBFT / Raast';
    } else if (w.payoutMethod?.methodType === 'easypaisa' || w.payoutMethod?.methodType === 'jazzcash') {
      channel = 'Easypaisa / JazzCash Business';
    }

    const hash = await computeRecordHash({
      businessName: business,
      partnerId: w.userId,
      amount: w.amount,
      currency: w.currency || 'PKR',
      utrReference: utr,
      settlementDate: cleanDate,
    });

    const record: SettlementRecord = {
      id: `VIP-${w.id.replace('wd-', '').toUpperCase()}`,
      mode: 'verified',
      withdrawalId: w.id,
      businessName: business,
      signatoryName: signatory,
      recipientName: recipient,
      partnerId: `DTA-${w.userId.slice(-6).toUpperCase()}`,
      amount: w.amount,
      currency: (w.currency as any) || 'PKR',
      totalProductsSold: totalProducts,
      cumulativeSettlements: options?.cumulativeSettlements || w.amount,
      partnerTier: tier,
      settlementDate: cleanDate,
      settlementTime: cleanTime,
      utrReference: utr,
      payoutChannel: channel,
      status: settlementStatus,
      platformName: 'Dream to Achievers Financial Node',
      platformLogoUrl: undefined,
      partnerLogoUrl: undefined,
      endorsementNote: w.adminNote || 'Authorized Commercial Settlement & Partner Revenue Disbursement',
      complianceHash: hash,
      template: options?.template || 'funding_pips_portrait',
      createdAt: new Date().toISOString(),
    };

    // Auto persist into certificate history
    this.saveCertificate(record);

    return record;
  },

  /**
   * Converts a milestone Reward into a verified B2B settlement record.
   */
  async createRecordFromReward(
    reward: Reward,
    userName: string,
    options?: {
      businessName?: string;
      cumulativeSettlements?: number;
      totalProductsSold?: number;
      template?: SettlementTemplateType;
    }
  ): Promise<SettlementRecord> {
    const dateStr = reward.paidAt || reward.approvedAt || reward.earnedAt;
    const cleanDate = dateStr ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const cleanTime = dateStr ? new Date(dateStr).toTimeString().slice(0, 8) + ' UTC' : '12:00:00 UTC';
    const utr = reward.transactionReference || `BONUS-${reward.id.toUpperCase()}`;
    const business = options?.businessName || userName || 'Enterprise Partner';

    const hash = await computeRecordHash({
      businessName: business,
      partnerId: reward.userId,
      amount: reward.amount,
      currency: reward.currency || 'PKR',
      utrReference: utr,
      settlementDate: cleanDate,
    });

    const record: SettlementRecord = {
      id: `VIP-REW-${reward.id.slice(-6).toUpperCase()}`,
      mode: 'verified',
      businessName: business,
      signatoryName: userName,
      recipientName: userName,
      partnerId: `DTA-${reward.userId.slice(-6).toUpperCase()}`,
      amount: reward.amount,
      currency: (reward.currency as any) || 'PKR',
      totalProductsSold: options?.totalProductsSold || 15,
      cumulativeSettlements: options?.cumulativeSettlements || reward.amount,
      partnerTier: `${reward.rankName} VIP Partner`,
      settlementDate: cleanDate,
      settlementTime: cleanTime,
      utrReference: utr,
      payoutChannel: '1-Link IBFT / Raast',
      status: reward.status === 'paid' ? 'Settled' : reward.status === 'approved' ? 'Disbursed' : 'Processed',
      platformName: 'Dream to Achievers Financial Node',
      platformLogoUrl: undefined,
      partnerLogoUrl: undefined,
      endorsementNote: `Executive Milestone Bonus Achievement: ${reward.rankName} Rank Tier Advancement`,
      complianceHash: hash,
      template: options?.template || 'funding_pips_portrait',
      createdAt: new Date().toISOString(),
    };

    this.saveCertificate(record);

    return record;
  },

  /**
   * Saves a generated certificate into local storage history.
   */
  saveCertificate(record: SettlementRecord): void {
    const list = storage.get<SettlementRecord[]>(STORAGE_KEY, []);
    const existingIndex = list.findIndex((c) => c.id === record.id || (record.withdrawalId && c.withdrawalId === record.withdrawalId));
    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.unshift(record);
    }
    storage.set(STORAGE_KEY, list.slice(0, 50));
  },

  /**
   * Retrieves certificate history.
   */
  getSavedCertificates(): SettlementRecord[] {
    return storage.get<SettlementRecord[]>(STORAGE_KEY, []);
  },

  /**
   * Retrieves a certificate by its withdrawal ID if present.
   */
  getCertificateByWithdrawalId(withdrawalId: string): SettlementRecord | undefined {
    const list = this.getSavedCertificates();
    return list.find((c) => c.withdrawalId === withdrawalId);
  },
};
