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
   */
  createSampleRecord(): SettlementRecord {
    const today = new Date().toISOString().slice(0, 10);
    return {
      id: `CERT-SAMPLE-${Date.now().toString(36).toUpperCase()}`,
      mode: 'draft',
      businessName: 'Apex Capital Holdings LLC',
      signatoryName: 'Marcus Sterling, Chief Financial Officer',
      partnerId: 'DTA-ORG-9842-GL',
      amount: 48500.0,
      currency: 'USD',
      cumulativeSettlements: 312750.0,
      partnerTier: 'Tier-1 Enterprise Partner',
      settlementDate: today,
      settlementTime: '14:32:00 UTC',
      utrReference: `UTR-2026-${Math.floor(100000 + Math.random() * 900000)}-SETTLE`,
      payoutChannel: 'Wire Transfer',
      status: 'Settled',
      platformName: 'Dream to Achievers Financial Node',
      platformLogoUrl: undefined,
      partnerLogoUrl: undefined,
      endorsementNote: 'Executive Revenue Share & Quarterly Performance Settlement',
      complianceHash: '7F9A2B4C8D0E1F3A5B7C9D1E3F5A7B9C1D3E5F7A9B1C3D5E7F9A1B3C5D7E9F1A',
      template: 'executive_statement',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Converts an authentic WithdrawalRequest into a verified B2B settlement record.
   */
  async createRecordFromWithdrawal(
    w: WithdrawalRequest,
    options?: {
      businessName?: string;
      signatoryName?: string;
      partnerTier?: string;
      cumulativeSettlements?: number;
      template?: SettlementTemplateType;
    }
  ): Promise<SettlementRecord> {
    const dateStr = w.processedAt || w.requestedAt;
    const cleanDate = dateStr ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const cleanTime = dateStr ? new Date(dateStr).toTimeString().slice(0, 8) + ' UTC' : '12:00:00 UTC';

    const utr = w.transactionReference || `TXN-${w.id.toUpperCase()}`;
    const business = options?.businessName || w.payoutMethod?.accountTitle || w.userName || 'Verified Partner';
    const signatory = options?.signatoryName || w.userName || 'Authorized Signatory';
    const tier = options?.partnerTier || 'Tier-1 Enterprise Partner';

    const statusMap: Record<string, SettlementStatus> = {
      paid: 'Settled',
      approved: 'Disbursed',
      pending: 'Pending Re-check',
      rejected: 'Pending Re-check',
    };
    const settlementStatus: SettlementStatus = statusMap[w.status] || 'Settled';

    let channel: PayoutChannel = 'Wire Transfer';
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

    return {
      id: `CERT-${w.id.replace('wd-', '').toUpperCase()}`,
      mode: 'verified',
      withdrawalId: w.id,
      businessName: business,
      signatoryName: signatory,
      partnerId: `ORG-${w.userId.slice(-6).toUpperCase()}`,
      amount: w.amount,
      currency: (w.currency as any) || 'PKR',
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
      template: options?.template || 'executive_statement',
      createdAt: new Date().toISOString(),
    };
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

    return {
      id: `CERT-REW-${reward.id.slice(-6).toUpperCase()}`,
      mode: 'verified',
      businessName: business,
      signatoryName: userName,
      partnerId: `ORG-${reward.userId.slice(-6).toUpperCase()}`,
      amount: reward.amount,
      currency: (reward.currency as any) || 'PKR',
      cumulativeSettlements: options?.cumulativeSettlements || reward.amount,
      partnerTier: `${reward.rankName} Partner`,
      settlementDate: cleanDate,
      settlementTime: cleanTime,
      utrReference: utr,
      payoutChannel: '1-Link IBFT / Raast',
      status: reward.status === 'paid' ? 'Settled' : reward.status === 'approved' ? 'Disbursed' : 'Pending Re-check',
      platformName: 'Dream to Achievers Financial Node',
      endorsementNote: `Executive Milestone Bonus Achievement: ${reward.rankName} Rank Tier Advancement`,
      complianceHash: hash,
      template: options?.template || 'platinum_milestone',
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Saves a generated certificate into local storage history.
   */
  saveCertificate(record: SettlementRecord): void {
    const list = storage.get<SettlementRecord[]>(STORAGE_KEY, []);
    const existingIndex = list.findIndex((c) => c.id === record.id);
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
};
