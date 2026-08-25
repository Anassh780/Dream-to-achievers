import React from 'react';
import { SITE_CONFIG } from '@/config/site';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, FileText, WarningCircle } from '@phosphor-icons/react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 font-sans">
      <div className="space-y-3">
        <Badge variant="accent" size="md">
          <FileText size={14} className="text-cyan-400" /> Platform Governance
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          Terms & Conditions of Partner Association
        </h1>
        <p className="text-xs font-mono text-slate-400">Last updated: January 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-[#090d16] p-8 rounded-3xl border border-white/10">
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">1. Partner Acceptance & Independence</h3>
          <p>
            By registering an account on Dream to Achievers, you agree to act as an independent commercial partner. Nothing in this agreement constitutes an employer-employee relationship, joint venture, or franchise arrangement.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">2. Product Margins & Transaction Verification</h3>
          <p>
            Gross profit margins are realized upon confirmed customer purchase. A product sale is considered qualifying for rank calculation only after payment verification and successful order fulfillment. Cancelled, refunded, fraudulent, or rejected orders do not contribute to rank requirements.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">3. Milestone Rank Rewards & Anti-Abuse Policies</h3>
          <p>
            Milestone cash rewards (Silver PKR 2,000, Platinum PKR 4,000, Gold PKR 6,000, Diamond PKR 10,000) are one-time achievement bonuses granted upon verified qualification of both product sales and unique community member thresholds. Duplicate, self-referred, or circular referral schemes are strictly prohibited and will result in account forfeiture.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">4. Contact & Disputes</h3>
          <p>
            All operational inquiries and partner dispute resolutions are handled directly through official channels at {SITE_CONFIG.supportEmail} or via WhatsApp at {SITE_CONFIG.whatsappNumber}.
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 font-sans">
      <div className="space-y-3">
        <Badge variant="emerald" size="md">
          <ShieldCheck size={14} className="text-emerald-400" /> Data Protection
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          Privacy Policy & Data Security
        </h1>
        <p className="text-xs font-mono text-slate-400">Last updated: January 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-[#090d16] p-8 rounded-3xl border border-white/10">
        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">1. Information We Collect</h3>
          <p>
            Dream to Achievers collects only the essential information required to manage your partner account, process product fulfillment, credit profit margins, and disburse rank achievement rewards. This includes your name, work email, phone number, and transaction logs.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">2. Usage of Referral Tracking Data</h3>
          <p>
            When a visitor navigates through your referral URL, our attribution engine registers the referral relationship to ensure community growth credits are accurately allocated. We never sell or share partner contact lists with third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">3. Security Standards</h3>
          <p>
            All account authentication and administrative management operations utilize encrypted session storage, role-based access validation, and immutable audit logging.
          </p>
        </section>
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 font-sans">
      <div className="space-y-3">
        <Badge variant="accent" size="md">
          <WarningCircle size={14} className="text-amber-400" /> Statutory Notice
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
          Earnings & Product Representation Disclaimer
        </h1>
        <p className="text-xs font-mono text-slate-400">Last updated: January 2026</p>
      </div>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-[#090d16] p-8 rounded-3xl border border-white/10">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs leading-relaxed">
          <strong>Official Policy Statement:</strong> {SITE_CONFIG.disclaimerText}
        </div>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">No Guaranteed Income Claim</h3>
          <p>
            Dream to Achievers makes zero representations or guarantees regarding specific financial income or earnings. Individual partner profits depend entirely on personal sales volume, marketing execution, customer satisfaction, and individual entrepreneurial commitment.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-lg font-bold text-white font-heading">Product Pricing Variability</h3>
          <p>
            Illustrative examples across the platform (such as retail price PKR 2,500, partner price PKR 2,000, margin PKR 500) serve as mathematical references. Actual catalog retail prices, partner wholesale purchase rates, and shipping variables fluctuate according to specific manufacturer batches and category updates.
          </p>
        </section>
      </div>
    </div>
  );
};
