import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SITE_CONFIG } from '@/config/site';
import {
  Check,
  PaperPlaneRight,
  WhatsappLogo,
  ArrowUpRight,
  ShieldCheck,
  ChatCircleText,
} from '@phosphor-icons/react';

export const Contact: React.FC = () => {
  const [selectedService, setSelectedService] = useState('Product Wholesale Distribution');
  const [brandName, setBrandName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const cleanWhatsApp = SITE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Hi Dream to Achievers team, I would like to inquire about ${selectedService}.`
  )}`;

  const servicesList = [
    'Product Wholesale Distribution',
    'Partner Rank Progression',
    'TikTok & Social Automation',
    'Paid Performance Marketing',
    'Catalog & Inventory Supply',
    'Enterprise Brand Partnerships',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setSubmitError('Please enter your email address.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('https://formsubmit.co/ajax/muskyna46@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `Inquiry for ${selectedService} - ${brandName || 'Partner'}`,
          service_requested: selectedService,
          brand_name: brandName || 'Not specified',
          client_email: userEmail,
          message_details: message || 'No message provided',
          submitted_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setBrandName('');
        setUserEmail('');
        setMessage('');
      } else {
        setIsSubmitted(true);
      }
    } catch (err) {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="w-full font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct WhatsApp Channel & Service Focus */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct WhatsApp Channel Block */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <ChatCircleText size={20} className="text-[#22C55E]" />
                  <h3 className="text-base font-heading font-bold text-white">Direct Channel</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#4ADE80] bg-[#22C55E]/10 px-2.5 py-0.5 rounded-full border border-[#22C55E]/20">
                  Fast Response
                </span>
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Have an urgent wholesale inquiry or partnership question? Reach our growth desk directly via WhatsApp for real-time support.
              </p>

              {/* WhatsApp Interactive Card */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 hover:border-[#22C55E]/40 flex items-center justify-between group transition-colors shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 flex items-center justify-center text-[#22C55E]">
                    <WhatsappLogo size={22} weight="fill" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Chat on WhatsApp</p>
                    <p className="text-[11px] text-[#4ADE80] font-mono">{SITE_CONFIG.whatsappNumber}</p>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#4ADE80] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <div className="flex items-center space-x-2 text-[11px] text-[#64748B] pt-1">
                <ShieldCheck size={15} className="text-[#3B82F6]" />
                <span>Official Dream to Achievers Support Channel</span>
              </div>
            </div>
          </div>

          {/* Service Selector Block */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-7 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#60A5FA] font-semibold block">
                Select Inquiry Topic
              </span>
              <div className="flex flex-wrap gap-2">
                {servicesList.map((svc) => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => setSelectedService(svc)}
                    className={`px-3 py-1.8 rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedService === svc
                        ? 'bg-[#3B82F6] text-white font-medium shadow-sm'
                        : 'bg-[#0A0F19] text-[#94A3B8] border border-white/5 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    {svc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Double-Bezel Form Card */}
        <div className="lg:col-span-7">
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6">
              <div className="pb-3 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-bold text-white">Submit Direct Inquiry</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Selected topic: <span className="text-[#60A5FA] font-medium">{selectedService}</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#64748B]">
                  Online Desk
                </span>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mx-auto">
                    <Check size={26} weight="bold" />
                  </div>
                  <h4 className="text-lg font-heading font-bold text-white">Inquiry Received</h4>
                  <p className="text-xs sm:text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out regarding <strong className="text-white">{selectedService}</strong>. Our partner support team will review your message and respond promptly.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsSubmitted(false)}
                      className="rounded-xl"
                    >
                      Submit Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {submitError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      {submitError}
                    </div>
                  )}

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Your Name / Brand Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Asad Enterprises"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0A0F19] border border-white/10 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="partner@domain.com"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0A0F19] border border-white/10 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#94A3B8] mb-1 font-medium">Inquiry Details / Volume Goals</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry, estimated volume, or partnership requirements..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0A0F19] border border-white/10 text-white placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full justify-center rounded-xl font-medium"
                    isLoading={isSubmitting}
                    iconRight={<PaperPlaneRight size={15} weight="bold" />}
                  >
                    Send Direct Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
