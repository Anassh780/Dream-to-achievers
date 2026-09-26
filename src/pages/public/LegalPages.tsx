import React from 'react';
import { SITE_CONFIG } from '@/config/site';
import { SEOHead } from '@/components/common/SEOHead';
import { FileText, Scales, LockKey } from '@phosphor-icons/react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="Terms & Conditions of Partner Association | Dream to Achievers"
        description="Official terms of association and distribution policies for partners of Dream to Achievers B2B wholesale platform."
        canonicalPath="/terms"
        ogType="website"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
            <FileText size={14} className="text-[#D9C08A]" />
            <span>Platform Governance &amp; Ethics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#F4F7F5] tracking-tight">
            Terms &amp; Conditions of Partner Association
          </h1>
          <p className="text-xs font-mono text-[#9EABA2]">Last updated: January 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#9EABA2] leading-relaxed bg-[#0D1512]/85 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-xl">
          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">1. Partner Acceptance &amp; Independence</h3>
            <p>
              By registering an account on Dream to Achievers, you agree to act as an independent commercial distributor. Nothing in this agreement constitutes an employer-employee relationship, joint venture, or franchise arrangement.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">2. Product Margins &amp; Transaction Verification</h3>
            <p>
              Gross profit margins are realized upon confirmed customer purchase. A product sale is considered qualifying for level calculation only after payment verification and successful order fulfillment. Cancelled, refunded, or rejected orders do not contribute to level requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">3. Milestone Level Rewards &amp; Anti-Abuse Policies</h3>
            <p>
              Milestone cash rewards (Level 01 PKR 2,000, Level 02 PKR 4,000, Level 03 PKR 6,000, Level 04 PKR 10,000) are one-time achievement bonuses granted upon verified qualification of both product sales and unique community member thresholds. Duplicate, self-referred, or circular referral schemes are strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">4. Contact &amp; Disputes</h3>
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="Privacy Policy & Data Security | Dream to Achievers"
        description="Read the official Privacy Policy of Dream to Achievers. Understand how partner information, orders, and transaction ledgers are protected."
        canonicalPath="/privacy"
        ogType="website"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
            <LockKey size={14} className="text-[#34D399]" />
            <span>Data Protection &amp; Confidentiality</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#F4F7F5] tracking-tight">
            Privacy Policy &amp; Data Security
          </h1>
          <p className="text-xs font-mono text-[#9EABA2]">Effective Date: January 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#9EABA2] leading-relaxed bg-[#0D1512]/85 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-xl">
          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">1. Data Collection</h3>
            <p>
              We collect information necessary to operate the wholesale distribution network, including partner names, contact emails, sales ledger entries, and transaction history.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">2. Data Utilization &amp; Confidentiality</h3>
            <p>
              Your contact details and transaction ledgers are utilized strictly for order verification, reward disbursements, and customer delivery coordination. We do not sell or monetize personal partner data.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">3. Security Standards</h3>
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] pb-24 font-sans selection:bg-[var(--accent)]/25">
      <SEOHead
        title="Statutory Earnings Disclaimer | Dream to Achievers"
        description="Official earnings and performance disclaimer for Dream to Achievers. Individual results vary based on customer sales volume and marketing diligence."
        canonicalPath="/disclaimer"
        ogType="website"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D9C08A]/10 border border-[#D9C08A]/30 text-[#D9C08A] text-xs font-mono">
            <Scales size={14} className="text-[#D9C08A]" />
            <span>Regulatory Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-[#F4F7F5] tracking-tight">
            Statutory Earnings Disclaimer
          </h1>
          <p className="text-xs font-mono text-[#9EABA2]">Published in accordance with transparency standards</p>
        </div>

        <div className="space-y-6 text-sm text-[#9EABA2] leading-relaxed bg-[#0D1512]/85 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-white/10 shadow-xl">
          <div className="p-4 rounded-2xl bg-[#070B09]/90 border border-[#D9C08A]/25 text-xs text-[#9EABA2]">
            {SITE_CONFIG.disclaimerText}
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">1. Individual Commercial Results</h3>
            <p>
              Statements regarding profit margins (+PKR 500/unit) and milestone rewards represent structural economics. Individual gross earnings depend on personal sales skill, client volume, and marketing diligence.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-serif font-medium text-[#F4F7F5]">2. No Guaranteed Income Claims</h3>
            <p>
              Dream to Achievers is a commercial wholesale platform. Participation does not guarantee fixed monthly remuneration without verified consumer sales activity.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
