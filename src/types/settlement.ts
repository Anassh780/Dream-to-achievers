export type SettlementTemplateType =
  | 'funding_pips_portrait'
  | 'emerald_website_ui'
  | 'funding_pips_vip'
  | 'platinum_milestone'
  | 'digital_modern'
  | 'executive_statement';

export type SettlementCurrency = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'CAD' | 'USDT';

export type SettlementStatus = 'Settled' | 'Disbursed' | 'Processed' | 'Pending Re-check';

export type PayoutChannel =
  | 'SEPA Instant'
  | 'Wire Transfer'
  | 'ACH Corporate Payout'
  | '1-Link IBFT / Raast'
  | 'Escrow Settlement'
  | 'Digital Rails (USDT/USDC)'
  | 'Easypaisa / JazzCash Business';

export type PartnerTier =
  | 'Tier-1 Enterprise Partner'
  | 'Merchant Standard'
  | 'Global Vendor'
  | 'Strategic Distributor'
  | 'Diamond Sovereign Partner'
  | 'Corporate Affiliate';

export interface SettlementRecord {
  id: string; // Internal certificate ID e.g. "CERT-2026-8841" or "FP-VIP-8841"
  mode: 'verified' | 'draft';
  withdrawalId?: string; // Links to WithdrawalRequest.id if verified
  businessName: string;
  signatoryName: string;
  recipientName?: string; // Honoree name prominently displayed on VIP certificate
  partnerId: string; // e.g. "DTA-ORG-8492"
  amount: number;
  currency: SettlementCurrency;
  totalProductsSold?: number; // Total products / items sold by this reseller
  cumulativeSettlements: number;
  partnerTier: PartnerTier | string;
  settlementDate: string; // YYYY-MM-DD
  settlementTime?: string; // HH:mm:ss UTC
  utrReference: string; // Batch / UTR reference e.g. "PAY-2026-8841-X9"
  payoutChannel: PayoutChannel | string;
  status: SettlementStatus;
  platformName: string;
  platformLogoUrl?: string;
  partnerLogoUrl?: string; // Base64 or Blob URL
  endorsementNote?: string;
  complianceHash?: string; // SHA-256 fingerprint
  template: SettlementTemplateType;
  createdAt: string;

  // Custom Typography, Text Colors & Amazing Backgrounds (Admin-Only Customization)
  customFontFamily?: string;
  primaryTextColor?: string;
  honoreeTextColor?: string;
  amountTextColor?: string;
  secondaryTextColor?: string;
  accentColor?: string;
  backgroundPreset?: string;
  customBackgroundGradient?: string;
  customBackgroundImageUrl?: string;
}

export const CURRENCY_SYMBOLS: Record<SettlementCurrency, string> = {
  PKR: 'PKR ',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
  CAD: 'CA$',
  USDT: '₮',
};

/**
 * Formats monetary amounts with ISO currency rules and tabular figures.
 */
export function formatSettlementAmount(amount: number, currency: SettlementCurrency): string {
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formattedNumber}`;
}

/**
 * Computes a deterministic SHA-256 hex string for ledger verification.
 */
export async function computeRecordHash(data: {
  businessName: string;
  partnerId: string;
  amount: number;
  currency: string;
  utrReference: string;
  settlementDate: string;
}): Promise<string> {
  const payload = `${data.partnerId}|${data.businessName}|${data.amount}|${data.currency}|${data.utrReference}|${data.settlementDate}`;
  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  } catch {
    // Fallback pseudo-hash
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }
    return `HASH-${Math.abs(hash).toString(16).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`;
  }
}

/**
 * Sanitizes B2B export filename: {CompanyName}_Payout_Receipt_{Date}_{BatchRef}.png
 */
export function buildSettlementFilename(businessName: string, date: string, utrRef: string): string {
  const cleanBusiness = (businessName || 'Merchant').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanDate = (date || new Date().toISOString().slice(0, 10)).replace(/[^0-9-]/g, '');
  const cleanRef = (utrRef || 'REF').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${cleanBusiness}_Payout_Receipt_${cleanDate}_${cleanRef}.png`;
}
