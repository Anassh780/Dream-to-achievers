import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SocialChannelsBar } from '@/components/ui/SocialIcons';
import {
  Check,
  PaperPlaneRight,
  ChatsCircle,
  ArrowUpRight,
  ShieldCheck,
  EnvelopeSimple,
  ShareNetwork,
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
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1512]/85 backdrop-blur-xl border border-white/10 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <h3 className="font-serif font-medium text-base text-[#F4F7F5]">Official Support Channels</h3>
              <span className="text-[10.5px] font-mono font-medium text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/25 px-2.5 py-0.5 rounded-full">
                Verified Desks
              </span>
            </div>

            <div className="space-y-3.5">
              {/* WhatsApp Official Channel */}
              <a
                href={whatsappChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-[#070B09]/90 hover:bg-[#131E1A] border border-white/[0.08] hover:border-[#D9C08A]/40 flex items-center justify-between text-xs transition-all duration-300 group shadow-md"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#131E1A] text-[#34D399] border border-[#34D399]/25 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ChatsCircle size={20} weight="bold" />
                  </div>
                  <div>
                    <span className="font-serif font-medium text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors block text-sm">Official WhatsApp Channel</span>
                    <span className="text-[11px] text-[#9EABA2]">
                      Get catalog updates &amp; alerts
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-[#9EABA2] group-hover:text-[#D9C08A] transition-colors" />
              </a>

              {/* Email Inquiries */}
              <a
                href={`mailto:${supportEmail}?subject=Partner%20Inquiry%20-%20Dream%20To%20Achievers`}
                className="p-4 rounded-2xl bg-[#070B09]/90 hover:bg-[#131E1A] border border-white/[0.08] hover:border-[#D9C08A]/40 flex items-center justify-between text-xs transition-all duration-300 group shadow-md"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#131E1A] border border-white/10 text-[#D9C08A] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <EnvelopeSimple size={20} weight="bold" />
                  </div>
                  <div>
                    <span className="font-serif font-medium text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors block text-sm">Email Support Desk</span>
                    <span className="text-[11px] font-mono text-[#9EABA2]">
                      {supportEmail}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={15} className="text-[#9EABA2] group-hover:text-[#D9C08A] transition-colors" />
              </a>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center space-x-2 text-[11px] text-[#9EABA2] font-mono">
                <ShieldCheck size={14} className="text-[#34D399]" weight="bold" />
                <span>Fast response turnaround from dedicated staff</span>
              </div>
              
              <div className="pt-3 border-t border-white/[0.08] space-y-2">
                <span className="text-[11px] font-mono text-[#F4F7F5] font-semibold block uppercase tracking-wider">
                  Follow Official Social Handles:
                </span>
                <SocialChannelsBar size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Send Query Form */}
        <div className="lg:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1512]/85 backdrop-blur-xl border border-white/10 shadow-xl space-y-6">
            <div className="space-y-1.5 pb-3 border-b border-white/10">
              <h3 className="font-serif font-normal text-xl text-[#F4F7F5]">Send a Query to Support</h3>
              <p className="text-xs text-[#9EABA2]">Fill out your details below and our team will get back to you promptly.</p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#070B09]/90 border border-[#34D399]/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#131E1A] text-[#34D399] flex items-center justify-center mx-auto border border-[#34D399]/30">
                  <Check size={24} weight="bold" />
                </div>
                <h4 className="font-serif font-medium text-lg text-[#F4F7F5]">Query Submitted Successfully</h4>
                <p className="text-xs text-[#9EABA2] max-w-sm mx-auto leading-relaxed">
                  Thank you for contacting Dream to Achievers. Our support desk has received your query and will reply to <span className="text-[#D9C08A] font-mono font-medium">{userContact}</span>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-medium text-xs mt-2 border-[#D9C08A]/40 text-[#D9C08A] hover:bg-[#D9C08A]/10"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send Another Query
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Topic Selector */}
                <div className="space-y-2">
                  <label className="block text-[#9EABA2] font-medium text-[11px]">Query Topic</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {servicesList.map((srv) => (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => setSelectedService(srv)}
                        className={`p-3 rounded-xl text-left text-xs transition-all duration-200 cursor-pointer ${
                          selectedService === srv
                            ? 'bg-[#D9C08A] text-[#070B09] font-semibold shadow-md border border-[#D9C08A]'
                            : 'bg-[#070B09]/90 text-[#9EABA2] hover:text-[#F4F7F5] border border-white/[0.08] hover:border-[#D9C08A]/40'
                        }`}
                      >
                        {srv}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[#9EABA2] font-medium text-[11px]">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ali Khan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[#9EABA2] font-medium text-[11px]">Your Email or WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="email@domain.com or phone"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[#9EABA2] font-medium text-[11px]">Your Question / Query</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your question or query here..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09]/90 border border-white/10 text-[#F4F7F5] placeholder:text-[#9EABA2]/50 text-xs focus:outline-none focus:border-[#D9C08A] resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="champagne"
                  size="md"
                  className="w-full justify-center font-medium text-xs shadow-lg"
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
