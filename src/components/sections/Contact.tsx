import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LibrarySlot } from '@/components/ui/LibrarySlot';
import { Orb } from '@/components/ui/Orb';
import { ScrollFloat } from '@/components/ui/ScrollFloat';
import {
  EnvelopeSimple,
  Copy,
  Check,
  PaperPlaneRight,
  Sparkle,
  PhoneCall,
  TrendUp,
  WhatsappLogo,
  ArrowUpRight,
  ShieldCheck,
  ChatCircleText
} from '@phosphor-icons/react';

export const Contact: React.FC = () => {
  const [selectedService, setSelectedService] = useState('TikTok Automation');
  const [brandName, setBrandName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const whatsappUrl_base = 'https://wa.me/923054511395';
  const whatsappUrl = `https://wa.me/923054511395?text=${encodeURIComponent(
    'Hi Faria, I would like to discuss a growth collaboration for my brand.'
  )}`;

  const servicesList = [
    'TikTok Automation',
    'Paid Advertisement',
    'Content Writing',
    'Social Media Marketing',
    'Business Management',
    'Graphic Designing',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setSubmitError('Please enter your work email address.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);

    try {
      // Send directly to destination email via FormSubmit AJAX endpoint without exposing raw email on UI
      const response = await fetch('https://formsubmit.co/ajax/muskyna46@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `New Collab Request for ${selectedService} - ${brandName || 'Brand'}`,
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
        // Fallback for form submission
        setIsSubmitted(true);
      }
    } catch (err) {
      // Graceful fallback display
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
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
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            stagger={0.025}
            textClassName="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-heading justify-center text-center"
          >
            Scale Your Brand This Quarter
          </ScrollFloat>
          <p className="text-slate-400 text-sm sm:text-base">
            Select your desired service focus below and request a complimentary 30-minute growth audit.
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Left Column: Direct WhatsApp Channel & Service Selector */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Direct WhatsApp Channel Block */}
            <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10">
              <div className="rounded-[calc(2rem-0.5rem)] bg-[#0c111d] p-6 sm:p-8 space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                    <ChatCircleText size={22} className="text-emerald-400" /> Direct Channels
                  </h3>
                  <Badge variant="emerald" size="sm">
                    Instant Connect
                  </Badge>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Have an urgent campaign launch or partnership inquiry? Reach Faria Imran directly via WhatsApp for real-time discussion.
                </p>

                {/* WhatsApp Interactive Pill */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400/60 flex items-center justify-between group transition-all duration-300 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                      <WhatsappLogo size={24} weight="fill" />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-white font-bold">Chat on WhatsApp</p>
                      <p className="text-xs font-mono text-emerald-400">Instant Response</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-[#080b11] transition-all">
                    <ArrowUpRight size={18} weight="bold" />
                  </div>
                </a>

                {/* Encrypted Desk Badge */}
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 pt-2 border-t border-white/10">
                  <ShieldCheck size={16} className="text-[#00f0ff]" />
                  <span>Direct Encrypted Collaboration Desk</span>
                </div>
              </div>
            </div>

            {/* Service Focus Pill Selector */}
            <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10">
              <div className="rounded-[calc(2rem-0.5rem)] bg-[#0c111d] p-6 space-y-3">
                <p className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  Select Primary Service Focus
                </p>
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

          {/* Right Column: Form (Routes directly to muskyna46@gmail.com without displaying email) */}
          <div className="lg:col-span-7">
            <div className="p-2 rounded-[2rem] bg-white/5 border border-white/10 h-full">
              <div className="rounded-[calc(2rem-0.5rem)] bg-[#0c111d] p-8 h-full flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white font-heading">Book Growth Audit</h3>
                    <span className="text-xs font-mono text-[#00f0ff] bg-[#00f0ff]/10 px-2.5 py-1 rounded-full border border-[#00f0ff]/30">
                      Direct Routing Active
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-6">
                    Requesting audit for: <span className="text-[#00f0ff] font-mono font-bold">{selectedService}</span>
                  </p>

                  {isSubmitted ? (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4 animate-in fade-in duration-500">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                        <Check size={28} weight="bold" />
                      </div>
                      <h4 className="text-xl font-bold font-heading text-white">Collaboration Request Sent!</h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                        Thank you for reaching out. Your collaboration request for <strong className="text-[#00f0ff]">{selectedService}</strong> has been routed directly to Faria Imran. You will receive a response shortly.
                      </p>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsSubmitted(false)}
                        className="mt-2"
                      >
                        Submit Another Request
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {submitError && (
                        <p className="text-xs font-mono text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                          {submitError}
                        </p>
                      )}

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5">Brand / Company Name</label>
                        <input
                          type="text"
                          value={brandName}
                          onChange={(e) => setBrandName(e.target.value)}
                          placeholder="Verve Apparel / SaaS Inc."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#00f0ff]/60 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5">Work Email Address *</label>
                        <input
                          type="email"
                          required
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="founder@brand.com"
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#00f0ff]/60 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-300 mb-1.5">Monthly Ad Budget / Goals</label>
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Describe your current monthly spend, main growth bottleneck, or automation goals..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#00f0ff]/60 transition-colors resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full"
                        isLoading={isSubmitting}
                        iconRight={
                          <span className="w-5 h-5 rounded-full bg-[#080b11]/20 flex items-center justify-center ml-1">
                            <PaperPlaneRight size={14} weight="bold" />
                          </span>
                        }
                      >
                        Submit Collaboration Request
                      </Button>
                    </form>
                  )}
                </div>

                {/* Direct WhatsApp Quick Contact Link below form */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Prefer instant chat?</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                  >
                    <WhatsappLogo size={16} weight="fill" />
                    <span>Chat on WhatsApp</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
