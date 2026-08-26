import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  Check,
  PaperPlaneRight,
  ChatsCircle,
  ArrowUpRight,
  ShieldCheck,
  EnvelopeSimple,
} from '@phosphor-icons/react';

export const Contact: React.FC = () => {
  const siteConfig = useSiteSettings();
  const [selectedService, setSelectedService] = useState('Wholesale Product Catalog');
  const [name, setName] = useState('');
  const [userContact, setUserContact] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const whatsappChannelUrl = siteConfig.whatsappChannelUrl || 'https://whatsapp.com/channel/0029VbDN1jHDuMRkoPvoii0N';
  const supportEmail = siteConfig.supportEmail || 'dreamtoachievers@gmail.com';

  const servicesList = [
    'Wholesale Product Catalog',
    'Partner Dashboard & Orders',
    'Milestone Bonus Verification',
    'General Partner Inquiry',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userContact) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <section id="contact" className="w-full font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Official Support Channels */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-[#E3DCC8] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCC8]">
              <h3 className="font-serif font-semibold text-base text-[#1E241F]">Official Support Channels</h3>
              <span className="text-[10.5px] font-mono font-medium text-[#1F4D3E] bg-[#F1ECDD] px-2.5 py-0.5 rounded border border-[#E3DCC8]">
                Verified
              </span>
            </div>

            <div className="space-y-3">
              {/* WhatsApp Official Channel */}
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#FAF7EF] hover:bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EFE2C4] text-[#1F4D3E] flex items-center justify-center">
                    <ChatsCircle size={20} weight="bold" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1E241F] block text-sm">Official WhatsApp Channel</span>
                    <span className="text-[11px] text-[#5B5C50]">
                      Get catalog updates &amp; alerts
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-[#5B5C50] group-hover:text-[#1E241F]" />
              </a>

              {/* Email Inquiries */}
              <a
                href={`mailto:${supportEmail}?subject=Partner%20Inquiry%20-%20Dream%20To%20Achievers`}
                className="p-4 rounded-xl bg-[#FAF7EF] hover:bg-[#F1ECDD] border border-[#E3DCC8] flex items-center justify-between text-xs transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1F4D3E] flex items-center justify-center">
                    <EnvelopeSimple size={20} weight="bold" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1E241F] block text-sm">Email Support Desk</span>
                    <span className="text-[11px] font-mono text-[#5B5C50]">
                      {supportEmail}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-[#5B5C50] group-hover:text-[#1E241F]" />
              </a>
            </div>

            <div className="pt-3 border-t border-[#E3DCC8] space-y-2">
              <div className="flex items-center space-x-2 text-[11px] text-[#5B5C50] font-mono">
                <ShieldCheck size={14} className="text-[#1F4D3E]" weight="bold" />
                <span>Fast response turnaround from dedicated staff</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send Query Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E3DCC8] shadow-xs space-y-5">
            <div className="space-y-1 pb-3 border-b border-[#E3DCC8]">
              <h3 className="font-serif font-semibold text-lg text-[#1E241F]">Send a Query to Support</h3>
              <p className="text-xs text-[#5B5C50]">Fill out your details below and our team will get back to you promptly.</p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-xl bg-[#F1ECDD] border border-[#E3DCC8] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-[#1F4D3E] flex items-center justify-center mx-auto border border-[#E3DCC8]">
                  <Check size={24} weight="bold" />
                </div>
                <h4 className="font-serif font-semibold text-lg text-[#1E241F]">Query Submitted Successfully</h4>
                <p className="text-xs text-[#5B5C50] max-w-sm mx-auto">
                  Thank you for contacting Dream to Achievers. Our support desk has received your query and will reply to <span className="text-[#1E241F] font-mono font-medium">{userContact}</span>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-medium text-xs mt-2"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Query
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Topic Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[#5B5C50] font-medium text-[11px]">Query Topic</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {servicesList.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          selectedService === srv
                            ? 'bg-[#1F4D3E] text-white font-medium shadow-2xs'
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
                    <label className="block text-[#5B5C50] font-medium text-[11px]">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ali Khan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[#5B5C50] font-medium text-[11px]">Your Email or WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="email@domain.com or phone"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[#5B5C50] font-medium text-[11px]">Your Question / Query</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your question or query here..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7EF] border border-[#E3DCC8] text-[#1E241F] text-xs focus:outline-none focus:border-[#1F4D3E] resize-none"
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
                  {isSubmitting ? 'Sending Query...' : 'Send Query to Support'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
