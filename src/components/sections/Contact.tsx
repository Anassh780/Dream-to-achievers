import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  Check,
  PaperPlaneRight,
  WhatsappLogo,
  ArrowUpRight,
  ShieldCheck,
  EnvelopeSimple,
  Sparkle,
} from '@phosphor-icons/react';

export const Contact: React.FC = () => {
  const siteConfig = useSiteSettings();
  const [selectedService, setSelectedService] = useState('Product Wholesale Distribution');
  const [brandName, setBrandName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Hi Dream to Achievers team, I would like to inquire about ${selectedService}.`
  )}`;

  const servicesList = [
    'Product Wholesale Distribution',
    'Partner Level Progression',
    'Catalog & Inventory Supply',
    'Enterprise Brand Partnerships',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <section id="contact" className="w-full font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Official Support Desks */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#060B18] border border-white/[0.08] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="font-heading font-bold text-sm text-white">Official Support Channels</h3>
              <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/25">
                Verified
              </span>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Direct Help */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <WhatsappLogo size={18} weight="fill" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Official WhatsApp Desk</span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      {siteConfig.whatsappNumber || '+92 305 4511395'}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              {/* Email Inquiries */}
              <a
                href={`mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`}
                className="p-4 rounded-2xl bg-[#030712] border border-white/[0.06] hover:border-white/15 flex items-center justify-between text-xs transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <EnvelopeSimple size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Email Inquiries</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span>Response turnaround: within 4 business hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Consultation Request Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#060B18] border border-white/[0.08] shadow-2xl space-y-5">
            <div className="space-y-1 pb-3 border-b border-white/[0.08]">
              <h3 className="font-heading font-bold text-base text-white">Send an Official Inquiry</h3>
              <p className="text-xs text-slate-400">Select your inquiry topic and our support team will connect promptly.</p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check size={24} weight="bold" />
                </div>
                <h4 className="font-heading font-bold text-base text-white">Inquiry Dispatched Successfully</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Thank you for reaching out. Our support desk has received your details and will reply to <span className="text-white font-mono">{userEmail}</span>.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-xl text-xs font-semibold"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-semibold text-[11px]">Inquiry Topic</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {servicesList.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`p-2.5 rounded-xl text-left text-xs transition-all ${
                          selectedService === srv
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                            : 'bg-[#030712] text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-300 font-semibold text-[11px]">Full Name / Entity</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Your name or business name"
                      className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-slate-300 font-semibold text-[11px]">Contact Email / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="email@domain.com or phone"
                      className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-300 font-semibold text-[11px]">Message Details</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide context regarding your distribution volume, inquiries, or requirements..."
                    className="w-full px-3 py-2 rounded-xl bg-[#030712] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  size="md"
                  className="w-full justify-center rounded-xl font-bold text-xs shadow-lg"
                  iconRight={<PaperPlaneRight size={14} weight="bold" />}
                >
                  {isSubmitting ? 'Transmitting...' : 'Submit Inquiry'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
