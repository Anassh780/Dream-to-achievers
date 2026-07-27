import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LibrarySlot } from '@/components/ui/LibrarySlot';
import { Orb } from '@/components/ui/Orb';
import { EnvelopeSimple, Copy, Check, PaperPlaneRight, Sparkle, PhoneCall, TrendUp } from '@phosphor-icons/react';

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [selectedService, setSelectedService] = useState('TikTok Automation');
  const email = 'growth@vanguard.agency';

  const servicesList = [
    'TikTok Automation',
    'Paid Advertisement',
    'Content Writing',
    'Social Media Marketing',
    'Business Management',
    'Graphic Designing',
  ];

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-24 bg-[#090d16] relative overflow-hidden">
      {/* Orb Interactive WebGL Shader Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-75">
        <Orb
          hoverIntensity={0.5}
          rotateOnHover={true}
          hue={180}
          forceHoverState={false}
          backgroundColor="#090d16"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <Badge variant="accent" size="md">
            <Sparkle size={14} className="text-[#00f0ff]" /> Vanguard Partnership Audit
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading">
            Scale Your Brand <span className="text-gradient-cyan">This Quarter</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Select your desired service focus below and request a complimentary 30-minute growth audit.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Left Column: Direct Info & Service Selector */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 h-full">
              <div className="rounded-[calc(2rem-0.5rem)] bg-[#0c111d] p-8 h-full flex flex-col justify-between space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white font-heading">Direct Channel</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Have an urgent campaign launch or enterprise ops inquiry? Copy our growth desk email directly.
                  </p>

                  {/* Email Copy Pill */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <EnvelopeSimple size={20} className="text-[#00f0ff]" />
                      <span className="font-mono text-xs sm:text-sm text-white font-semibold">{email}</span>
                    </div>
                    <button
                      onClick={handleCopyEmail}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                      title="Copy Email Address"
                    >
                      {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                {/* Service Focus Pill Selector */}
                <div className="space-y-3 pt-6 border-t border-white/10">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Select Primary Service Focus</p>
                  <div className="flex flex-wrap gap-2">
                    {servicesList.map((svc) => (
                      <button
                        key={svc}
                        onClick={() => setSelectedService(svc)}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                          selectedService === svc
                            ? 'bg-[#00f0ff] text-[#080b11] font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                            : 'bg-white/5 text-slate-300 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form & Extension Slot */}
          <div className="lg:col-span-7">
            <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 h-full">
              <div className="rounded-[calc(2rem-0.5rem)] bg-[#0c111d] p-8 h-full flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2 font-heading">Book Growth Audit</h3>
                  <p className="text-sm text-slate-300 mb-6">
                    Requesting audit for: <span className="text-[#00f0ff] font-mono font-bold">{selectedService}</span>
                  </p>

                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">Brand / Company Name</label>
                      <input
                        type="text"
                        placeholder="Verve Apparel / SaaS Inc."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#00f0ff]/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">Work Email Address</label>
                      <input
                        type="email"
                        placeholder="founder@brand.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#00f0ff]/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">Monthly Ad Budget / Goals</label>
                      <textarea
                        rows={3}
                        placeholder="Describe your current monthly spend, main growth bottleneck, or automation goals..."
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#00f0ff]/60 transition-colors resize-none"
                      />
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      iconRight={
                        <span className="w-5 h-5 rounded-full bg-[#080b11]/20 flex items-center justify-center ml-1">
                          <PaperPlaneRight size={14} weight="bold" />
                        </span>
                      }
                    >
                      Request Audit Session
                    </Button>
                  </form>
                </div>

                {/* Library Slot for external widgets / Calendly */}
                <div className="pt-4 border-t border-white/10">
                  <LibrarySlot
                    slotName="UI Library Slot (Calendly / Typeform / Shadcn Dialog)"
                    fallbackMessage="Extension slot ready for plugging in external Calendly embed or React Hook Form components."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
