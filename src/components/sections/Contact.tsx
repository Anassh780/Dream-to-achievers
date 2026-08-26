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
          <div className="p-6 sm:p-7 rounded-xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <h3 className="font-display font-medium text-base text-[#1E241F]">Official Desk Channels</h3>
              <span className="text-[10.5px] font-mono font-medium text-[#1F4D3E] bg-[#F1ECDD] px-2 py-0.5 rounded border border-[#E3DCC8]">
                Verified
              </span>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Direct Help */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-[#FAF7EF] hover:bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFE2C4] text-[#1F4D3E] flex items-center justify-center">
                    <WhatsappLogo size={18} weight="bold" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1E241F] block">Official WhatsApp Desk</span>
                    <span className="text-[11px] font-mono text-[#5B5C50]">
                      {siteConfig.whatsappNumber || '+92 305 4511395'}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-[#5B5C50] group-hover:text-[#1E241F]" />
              </a>

              {/* Email Inquiries */}
              <a
                href={`mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`}
                className="p-4 rounded-lg bg-[#FAF7EF] hover:bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1F4D3E] flex items-center justify-center">
                    <EnvelopeSimple size={18} />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1E241F] block">Email Inquiries</span>
                    <span className="text-[11px] font-mono text-[#5B5C50]">
                      {siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-[#5B5C50] group-hover:text-[#1E241F]" />
              </a>
            </div>

            <div className="pt-3 border-t border-[#E3DCC8] space-y-2">
              <div className="flex items-center space-x-2 text-[11px] text-[#5B5C50] font-mono">
                <ShieldCheck size={14} className="text-[#1F4D3E]" />
                <span>Response turnaround: within 4 business hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Consultation Request Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#E3DCC8] shadow-xs space-y-5">
            <div className="space-y-1 pb-3 border-b border-[#E3DCC8]">
              <h3 className="font-display font-medium text-base text-[#1E241F]">Send an Official Inquiry</h3>
              <p className="text-xs text-[#5B5C50]">Select your inquiry topic and our support team will connect promptly.</p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-lg bg-[#F1ECDD] border border-[#E3DCC8] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-[#1F4D3E] flex items-center justify-center mx-auto border border-[#E3DCC8]">
                  <Check size={24} weight="bold" />
                </div>
                <h4 className="font-display font-medium text-base text-[#1E241F]">Inquiry Dispatched Successfully</h4>
                <p className="text-xs text-[#5B5C50] max-w-sm mx-auto">
                  Thank you for reaching out. Our support desk has received your details and will reply to <span className="text-[#1E241F] font-mono font-medium">{userEmail}</span>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-medium text-xs"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[#5B5C50] font-medium text-[11px]">Inquiry Topic</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {servicesList.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          selectedService === srv
                            ? 'bg-[#1F4D3E] text-white font-medium'
                            : 'bg-[#FAF7EF] text-[#5B5C50] hover:text-[#1E241F] border border-[#E3DCC8]'
                        }`}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[#5B5C50] font-medium text-[11px]">Full Name / Entity</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Your name or business name"
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[#5B5C50] font-medium text-[11px]">Contact Email / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="email@domain.com or phone"
                      className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[#5B5C50] font-medium text-[11px]">Message Details</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide context regarding your distribution volume, inquiries, or requirements..."
                    className="w-full px-3 py-2 rounded-lg bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  size="md"
                  className="w-full justify-center font-medium text-xs shadow-xs"
                  iconRight={<PaperPlaneRight size={14} />}
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
