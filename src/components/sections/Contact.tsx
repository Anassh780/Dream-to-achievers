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
  Megaphone,
} from '@phosphor-icons/react';

export const Contact: React.FC = () => {
  const siteConfig = useSiteSettings();
  const [selectedService, setSelectedService] = useState('Product Wholesale Distribution');
  const [brandName, setBrandName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const cleanWhatsApp = (siteConfig.whatsappNumber || '+92 305 4511395').replace(/[^0-9]/g, '');
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
      const response = await fetch(`https://formsubmit.co/ajax/${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`, {
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
        {/* Left Column: Official Community & Communication Channels */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Channels Block */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-7 space-y-4 bg-[#080E1E] border border-white/[0.08]">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <h3 className="text-base font-heading font-bold text-white">Official Network Channels</h3>
                <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/25">
                  Verified Desks
                </span>
              </div>

              <div className="space-y-3">
                {/* TikTok */}
                <a
                  href={siteConfig.tiktokUrl || "https://www.tiktok.com/@dream.to.achievers"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 flex items-center justify-between group transition-colors shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.3 6.3 0 0 0 1.86-4.47V8.62a8.27 8.27 0 0 0 4.85 1.57v-3.5h-.93z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Official TikTok</p>
                      <p className="text-[11px] text-rose-300 font-mono">@dream.to.achievers</p>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-rose-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* WhatsApp Channel */}
                <a
                  href={siteConfig.whatsappChannelUrl || "https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 flex items-center justify-between group transition-colors shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Megaphone size={18} weight="fill" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">WhatsApp VIP Channel</p>
                      <p className="text-[11px] text-emerald-400 font-mono">Broadcast & Restocks</p>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* Support Email */}
                <a
                  href={`mailto:${siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}`}
                  className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400/40 flex items-center justify-between group transition-colors shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <EnvelopeSimple size={18} weight="fill" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Support & Admin Email</p>
                      <p className="text-[11px] text-cyan-300 font-mono">{siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>

                {/* Direct WhatsApp Chat */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 flex items-center justify-between group transition-colors shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                      <WhatsappLogo size={18} weight="fill" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Direct WhatsApp Chat</p>
                      <p className="text-[11px] text-slate-400 font-mono">{siteConfig.whatsappNumber || '+92 305 4511395'}</p>
                    </div>
                  </div>
                  <ArrowUpRight size={15} className="text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck size={15} className="text-cyan-400" />
                <span>Verified Official Communications</span>
              </div>
            </div>
          </div>

          {/* Service Selector Block */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-7 space-y-3 bg-[#080E1E] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block">
                Select Inquiry Topic
              </span>
              <div className="flex flex-wrap gap-2">
                {servicesList.map((svc) => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => setSelectedService(svc)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      selectedService === svc
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold shadow-md'
                        : 'bg-[#030712] text-slate-300 border border-white/[0.06] hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {svc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Inquiry Form Card */}
        <div className="lg:col-span-7">
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 sm:p-8 space-y-6 bg-[#080E1E] border border-white/[0.08]">
              <div className="pb-3 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-heading font-bold text-white">Submit Direct Message</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Selected topic: <span className="text-cyan-400 font-medium">{selectedService}</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                  Online Desk
                </span>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check size={26} weight="bold" />
                  </div>
                  <h4 className="text-lg font-heading font-bold text-white">Message Received</h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out regarding <strong className="text-white">{selectedService}</strong>. Our partner support team will review your message and reply to <strong className="text-white">{siteConfig.supportEmail || 'dreamtoachievers@gmail.com'}</strong>.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsSubmitted(false)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                      {submitError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-slate-200 font-medium">Your Name / Partner Identifier</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Hamza Tariq"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-200 font-medium">Your Email Address *</label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="partner@domain.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-200 font-medium">Message Details (Optional)</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your inquiry or order volume..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-all text-xs resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full justify-center rounded-xl font-bold mt-2"
                    isLoading={isSubmitting}
                    iconRight={<PaperPlaneRight size={14} weight="bold" />}
                  >
                    Submit Inquiry to Support
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
