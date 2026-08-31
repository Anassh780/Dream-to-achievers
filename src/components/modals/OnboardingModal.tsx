import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  X,
  Sparkle,
  Package,
  ShoppingCart,
  Wallet,
  Gift,
  ArrowRight,
} from '@phosphor-icons/react';

interface OnboardingModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  userId,
  userName,
  isOpen,
  onClose,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(true);

  if (!isOpen) return null;

  const handleDismiss = () => {
    if (dontShowAgain && userId) {
      localStorage.setItem(`dta_onboarding_dismissed_${userId}`, 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3DCC8] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-linear-to-br from-[#1F4D3E] to-[#153A2E] text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} weight="bold" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-mono text-[#D4AF37] mb-1.5">
            <Sparkle size={15} weight="fill" />
            <span>Welcome to Dream to Achievers Wholesale Network</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Welcome, {userName}! 🎉
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-lg">
            Here is your simple 4-step roadmap to start sourcing wholesale products, fulfilling client orders, and withdrawing daily profits.
          </p>
        </div>

        {/* Modal Body: 4 Visual Cards */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2 hover:border-[#1F4D3E]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-[#1F4D3E] text-white font-mono font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <Package size={20} className="text-[#1F4D3E]" />
              </div>
              <p className="font-bold text-sm text-[#1E241F]">Choose Wholesale Products</p>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Browse our verified wholesale catalog. Every product offers profit margins up to <strong className="text-[#1F4D3E]">PKR 1,000+</strong> per item.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2 hover:border-[#1F4D3E]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-[#1F4D3E] text-white font-mono font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <ShoppingCart size={20} className="text-[#1F4D3E]" />
              </div>
              <p className="font-bold text-sm text-[#1E241F]">Sell &amp; Submit Orders</p>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Share products with clients. Enter customer delivery address &amp; payment screenshot in 1 click.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2 hover:border-[#1F4D3E]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-[#1F4D3E] text-white font-mono font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <Wallet size={20} className="text-[#1F4D3E]" />
              </div>
              <p className="font-bold text-sm text-[#1E241F]">Direct Profit Payout</p>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Once admin confirms dispatch, your profit is credited to your balance. Withdraw directly into <strong className="text-[#1E241F]">Easypaisa, JazzCash, or Bank</strong>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-[#FAF7EF] border border-[#E3DCC8] space-y-2 hover:border-[#1F4D3E]/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-[#1F4D3E] text-white font-mono font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <Gift size={20} className="text-[#B8862E]" />
              </div>
              <p className="font-bold text-sm text-[#1E241F]">Milestone Cash Rewards</p>
              <p className="text-xs text-[#5B5C50] leading-relaxed">
                Share your referral link with friends. As your partner team grows, unlock cash bonuses up to <strong className="text-[#B8862E]">PKR 150,000+</strong>!
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-[#FAF7EF] border-t border-[#E3DCC8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center space-x-2 text-xs text-[#5B5C50] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-[#E3DCC8] text-[#1F4D3E] focus:ring-[#1F4D3E] cursor-pointer"
            />
            <span>Don't show this popup automatically again</span>
          </label>

          <Button
            onClick={handleDismiss}
            variant="primary"
            size="md"
            className="w-full sm:w-auto px-6 font-semibold text-xs py-2.5 shadow-xs cursor-pointer"
            iconRight={<ArrowRight size={15} />}
          >
            Start Earning Now
          </Button>
        </div>
      </div>
    </div>
  );
};
