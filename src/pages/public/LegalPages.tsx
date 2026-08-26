import React from 'react';
import { SITE_CONFIG } from '@/config/site';
import { ShieldCheck, FileText, Scales, LockKey } from '@phosphor-icons/react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-24 sm:pt-28 space-y-8">
        <div className="space-y-3">
          <div className="eyebrow">
            <FileText size={14} className="text-cyan-400" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Terms & Conditions of Partner Association
          </h1>
          <p className="text-xs font-mono text-slate-400">Last updated: January 2026</p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#060B18] p-7 sm:p-9 rounded-3xl border border-white/[0.08] shadow-2xl">
          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">1. Partner Acceptance & Independence</h3>
            <p>
              By registering an account on DreamToAchievers, you agree to act as an independent commercial distributor. Nothing in this agreement constitutes an employer-employee relationship, joint venture, or franchise arrangement.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">2. Product Margins & Transaction Verification</h3>
            <p>
              Gross profit margins are realized upon confirmed customer purchase. A product sale is considered qualifying for level calculation only after payment verification and successful order fulfillment. Cancelled, refunded, or rejected orders do not contribute to level requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">3. Milestone Level Rewards & Anti-Abuse Policies</h3>
            <p>
              Milestone cash rewards (Level 01 PKR 2,000, Level 02 PKR 4,000, Level 03 PKR 6,000, Level 04 PKR 10,000) are one-time achievement bonuses granted upon verified qualification of both product sales and unique community member thresholds. Duplicate, self-referred, or circular referral schemes are strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">4. Contact & Disputes</h3>
            <p>
              All operational inquiries and partner dispute resolutions are handled directly through official channels at {SITE_CONFIG.supportEmail} or via WhatsApp at {SITE_CONFIG.whatsappNumber}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-24 sm:pt-28 space-y-8">
        <div className="space-y-3">
          <div className="eyebrow">
            <LockKey size={14} className="text-cyan-400" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Privacy Policy & Data Security
          </h1>
          <p className="text-xs font-mono text-slate-400">Effective Date: January 2026</p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#060B18] p-7 sm:p-9 rounded-3xl border border-white/[0.08] shadow-2xl">
          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">1. Data Collection</h3>
            <p>
              We collect information necessary to operate the wholesale distribution network, including partner names, contact emails, sales ledger entries, and transaction history.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">2. Data Utilization & Confidentiality</h3>
            <p>
              Your contact details and transaction ledgers are utilized strictly for order verification, reward disbursements, and customer delivery coordination. We do not sell or monetize personal partner data.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">3. Security Standards</h3>
            <p>
              Platform access requires authenticated credentials with encrypted sessions. Administrative actions and financial ledger records are tracked through permanent audit logs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020612] text-[#F8FAFC] pb-24 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-24 sm:pt-28 space-y-8">
        <div className="space-y-3">
          <div className="eyebrow">
            <Scales size={14} className="text-cyan-400" />
            <span>Regulatory Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Statutory Earnings Disclaimer
          </h1>
          <p className="text-xs font-mono text-slate-400">Published in accordance with transparency standards</p>
        </div>

        <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#060B18] p-7 sm:p-9 rounded-3xl border border-white/[0.08] shadow-2xl">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs">
            {SITE_CONFIG.disclaimerText}
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">1. Individual Commercial Results</h3>
            <p>
              Statements regarding profit margins (+PKR 500/unit) and milestone rewards represent structural economics. Individual gross earnings depend on personal sales skill, client volume, and marketing diligence.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-heading font-bold text-white">2. No Guaranteed Income Claims</h3>
            <p>
              DreamToAchievers is a commercial wholesale platform. Participation does not guarantee fixed monthly remuneration without verified consumer sales activity.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
