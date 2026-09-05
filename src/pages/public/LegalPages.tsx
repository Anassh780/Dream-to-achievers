import React from 'react';
import { SITE_CONFIG } from '@/config/site';
import { SEOHead } from '@/components/common/SEOHead';
import { FileText, Scales, LockKey } from '@phosphor-icons/react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      <SEOHead
        title="Terms & Conditions of Partner Association | Dream to Achievers"
        description="Official terms of association and distribution policies for partners of Dream to Achievers B2B wholesale platform."
        canonicalPath="/terms"
        ogType="website"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3">
          <div className="eyebrow">
            <FileText size={14} className="text-[#1F4D3E]" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-[#1E241F]">
            Terms &amp; Conditions of Partner Association
          </h1>
          <p className="text-xs font-mono text-[#5B5C50]">Last updated: January 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#5B5C50] leading-relaxed bg-white p-8 rounded-xl border border-[#E3DCC8] shadow-xs">
          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">1. Partner Acceptance &amp; Independence</h3>
            <p>
              By registering an account on DreamToAchievers, you agree to act as an independent commercial distributor. Nothing in this agreement constitutes an employer-employee relationship, joint venture, or franchise arrangement.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">2. Product Margins &amp; Transaction Verification</h3>
            <p>
              Gross profit margins are realized upon confirmed customer purchase. A product sale is considered qualifying for level calculation only after payment verification and successful order fulfillment. Cancelled, refunded, or rejected orders do not contribute to level requirements.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">3. Milestone Level Rewards &amp; Anti-Abuse Policies</h3>
            <p>
              Milestone cash rewards (Level 01 PKR 2,000, Level 02 PKR 4,000, Level 03 PKR 6,000, Level 04 PKR 10,000) are one-time achievement bonuses granted upon verified qualification of both product sales and unique community member thresholds. Duplicate, self-referred, or circular referral schemes are strictly prohibited.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">4. Contact &amp; Disputes</h3>
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
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      <SEOHead
        title="Privacy Policy & Data Security | Dream to Achievers"
        description="Read the official Privacy Policy of Dream to Achievers. Understand how partner information, orders, and transaction ledgers are protected."
        canonicalPath="/privacy"
        ogType="website"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3">
          <div className="eyebrow">
            <LockKey size={14} className="text-[#1F4D3E]" />
            <span>Data Protection &amp; Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-[#1E241F]">
            Privacy Policy &amp; Data Security
          </h1>
          <p className="text-xs font-mono text-[#5B5C50]">Effective Date: January 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#5B5C50] leading-relaxed bg-white p-8 rounded-xl border border-[#E3DCC8] shadow-xs">
          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">1. Data Collection</h3>
            <p>
              We collect information necessary to operate the wholesale distribution network, including partner names, contact emails, sales ledger entries, and transaction history.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">2. Data Utilization &amp; Confidentiality</h3>
            <p>
              Your contact details and transaction ledgers are utilized strictly for order verification, reward disbursements, and customer delivery coordination. We do not sell or monetize personal partner data.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">3. Security Standards</h3>
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
    <div className="min-h-screen bg-[#FAF7EF] text-[#1E241F] pb-24 font-sans selection:bg-[#B8862E]/25">
      <SEOHead
        title="Statutory Earnings Disclaimer | Dream to Achievers"
        description="Official earnings and performance disclaimer for Dream to Achievers. Individual results vary based on customer sales volume and marketing diligence."
        canonicalPath="/disclaimer"
        ogType="website"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-3">
          <div className="eyebrow">
            <Scales size={14} className="text-[#1F4D3E]" />
            <span>Regulatory Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-medium text-[#1E241F]">
            Statutory Earnings Disclaimer
          </h1>
          <p className="text-xs font-mono text-[#5B5C50]">Published in accordance with transparency standards</p>
        </div>

        <div className="space-y-6 text-sm text-[#5B5C50] leading-relaxed bg-white p-8 rounded-xl border border-[#E3DCC8] shadow-xs">
          <div className="p-4 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-xs text-[#5B5C50]">
            {SITE_CONFIG.disclaimerText}
          </div>

          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">1. Individual Commercial Results</h3>
            <p>
              Statements regarding profit margins (+PKR 500/unit) and milestone rewards represent structural economics. Individual gross earnings depend on personal sales skill, client volume, and marketing diligence.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-display font-medium text-[#1E241F]">2. No Guaranteed Income Claims</h3>
            <p>
              DreamToAchievers is a commercial wholesale platform. Participation does not guarantee fixed monthly remuneration without verified consumer sales activity.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
