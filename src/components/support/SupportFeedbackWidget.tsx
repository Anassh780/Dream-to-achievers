import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { feedbackService } from '@/services/feedbackService';
import type { FeedbackCategory, SupportChatMessage } from '@/types';
import {
  ChatCircleDots,
  PaperPlaneRight,
  Star,
  X,
  Sparkle,
  Headset,
  CheckCircle,
  Bug,
  Lightbulb,
  Palette,
  ThumbsUp,
  ShieldCheck,
  Robot,
  Minus,
} from '@phosphor-icons/react';

export const SupportFeedbackWidget: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Widget visibility state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bot' | 'feedback'>('bot');
  const modalRef = useRef<HTMLDivElement>(null);

  // --- BOT CHAT STATE ---
  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: `Hello ${user?.fullName || 'there'}! Welcome to Dream to Achievers Live Desk. Ask me anything about Ranks, Payouts, COD Selling, or click "Talk to Live Agent".`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showLiveEscalation, setShowLiveEscalation] = useState(false);
  const [escalatePhone, setEscalatePhone] = useState(user?.phone || '');
  const [escalateEmail, setEscalateEmail] = useState(user?.email || '');
  const [isEscalating, setIsEscalating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- FEEDBACK FORM STATE ---
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('ux');
  const [subject, setSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [userName, setUserName] = useState(user?.fullName || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Sync user info if changed
  useEffect(() => {
    if (user) {
      setUserName(user.fullName || '');
      setUserEmail(user.email || '');
      setEscalateEmail(user.email || '');
      if (user.phone) setEscalatePhone(user.phone);
    }
  }, [user]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'bot' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, activeTab]);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 150);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Send message to Bot
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: SupportChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Bot response simulation with Funding Pips response engine
    setTimeout(() => {
      const response = feedbackService.getBotResponse(text, user?.fullName);
      const botMsg: SupportChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);

      if (response.isLiveAgentRequest) {
        setShowLiveEscalation(true);
      }
    }, 550);
  };

  // Submit Live Agent Escalation Request
  const handleEscalateToLiveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateEmail) return;

    setIsEscalating(true);
    try {
      await feedbackService.createTicket({
        userId: user?.id,
        userName: userName || user?.fullName || 'Guest Reseller',
        userEmail: escalateEmail,
        whatsapp: escalatePhone,
        subject: `Live Support Inquiry: ${messages[messages.length - 1]?.text?.substring(0, 50) || 'General Support'}`,
        category: 'live_desk',
        priority: 'urgent',
        messages: messages,
      });

      setShowLiveEscalation(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `✅ **Live Ticket Dispatched to Admin!**\nOur VIP support team is notified. We will reach out to **${escalateEmail}** ${escalatePhone ? `and WhatsApp (${escalatePhone})` : ''} as soon as possible.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error escalating to live agent:', err);
    } finally {
      setIsEscalating(false);
    }
  };

  // Submit Feedback Form
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim() || !userEmail.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
      await feedbackService.submitFeedback({
        userId: user?.id,
        userName: userName || 'Anonymous Reseller',
        userEmail: userEmail.trim(),
        rating,
        category,
        sentiment,
        subject: subject.trim() || `${category.toUpperCase()} Feedback`,
        message: feedbackMessage.trim(),
        pageUrl: location.pathname,
        deviceInfo: typeof navigator !== 'undefined' ? `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'} - ${navigator.platform}` : 'Web',
      });

      setFeedbackSuccess(true);
    } catch (err) {
      console.error('Feedback submit error:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1:
        return 'Needs Improvement';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Great Experience';
      case 5:
        return 'Exceptional!';
      default:
        return '';
    }
  };

  const categoryIcons: Record<FeedbackCategory, React.ReactNode> = {
    ux: <Palette size={15} weight="bold" />,
    feature: <Lightbulb size={15} weight="bold" />,
    bug: <Bug size={15} weight="bold" />,
    support: <Headset size={15} weight="bold" />,
    general: <ThumbsUp size={15} weight="bold" />,
  };

  return (
    <>
      {/* Mobile Subtle Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[85] bg-black/55 backdrop-blur-[2px] sm:hidden transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* ========================================================
          FLOATING ACTION LAUNCHER BUTTON (FUNDING PIPS SIGNATURE)
          ======================================================== */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[80] flex items-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Live Support and Feedback"
            className="group relative flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-[#0D1512]/95 hover:bg-[#131E1A] border border-[#D9C08A]/40 text-[#F4F7F5] shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(217,192,138,0.22)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#D9C08A]/60"
          >
            {/* Ambient Pulse Glow */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#D9C08A]/30 via-[#34D399]/30 to-[#D9C08A]/30 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Glowing Icon with Online Indicator */}
            <div className="relative z-10 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D9C08A]/20 border border-[#D9C08A]/45 text-[#D9C08A] shadow-[0_0_12px_rgba(217,192,138,0.35)] shrink-0">
              <Headset size={16} weight="bold" className="animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-[#070B09]" />
            </div>

            {/* Label */}
            <div className="relative z-10 flex flex-col text-left">
              <span className="text-[11px] sm:text-xs font-bold tracking-wide text-[#F4F7F5] flex items-center gap-1 font-serif whitespace-nowrap">
                Support & Feedback
                <Sparkle size={11} weight="fill" className="text-[#D9C08A] hidden sm:inline" />
              </span>
              <span className="text-[9px] text-[#34D399] font-medium tracking-wider uppercase font-mono">
                ● Live 24/7 Desk
              </span>
            </div>
          </button>
        )}
      </div>

      {/* ========================================================
          EXPANDABLE MODAL / DRAWER PANEL
          - Clamped to prevent ANY collision with top navbar
          - z-[90] guarantees it is strictly above the navbar (z-50)
          ======================================================== */}
      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Customer Support and Feedback"
          className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[90] w-[calc(100vw-24px)] sm:w-[390px] md:w-[410px] h-[520px] max-h-[calc(100dvh-5.5rem)] flex flex-col rounded-2xl bg-[#090F0C] border border-[#D9C08A]/35 text-[#F4F7F5] shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(217,192,138,0.18)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Ambient Corner Glows */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-[radial-gradient(circle,rgba(217,192,138,0.18),transparent_70%)] blur-2xl -z-10" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-[radial-gradient(circle,rgba(52,211,153,0.12),transparent_70%)] blur-2xl -z-10" />

          {/* ========================================================
              TOP HEADER BAR (ALWAYS VISIBLE & PROMINENT)
              ======================================================== */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#D9C08A]/20 bg-[#0D1512] shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-[#D9C08A]/20 border border-[#D9C08A]/40 text-[#D9C08A] shrink-0 shadow-[0_0_10px_rgba(217,192,138,0.2)]">
                <Robot size={18} weight="bold" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34D399] border-2 border-[#0D1512]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold font-serif text-[#F4F7F5] flex items-center gap-1.5 truncate">
                  Dream Support Desk
                  <ShieldCheck size={14} weight="fill" className="text-[#34D399] shrink-0" />
                </h3>
                <p className="text-[10px] text-[#9EABA2] flex items-center gap-1.5 font-mono truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-ping shrink-0" />
                  Instant AI Bot & Live Escalation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/10 active:scale-95 transition-all"
                title="Minimize Support Window"
                aria-label="Minimize"
              >
                <Minus size={15} weight="bold" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9EABA2] hover:text-rose-400 hover:bg-rose-500/10 active:scale-95 transition-all"
                title="Close Support Window"
                aria-label="Close"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* ========================================================
              NAVIGATION TABS
              ======================================================== */}
          <div className="grid grid-cols-2 p-1 bg-[#070B09] border-b border-white/5 shrink-0">
            <button
              onClick={() => setActiveTab('bot')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bot'
                  ? 'bg-[#D9C08A]/20 text-[#D9C08A] border border-[#D9C08A]/35 shadow-sm'
                  : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/5'
              }`}
            >
              <ChatCircleDots size={15} weight="bold" />
              <span>Ask AI / Live Agent</span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'feedback'
                  ? 'bg-[#D9C08A]/20 text-[#D9C08A] border border-[#D9C08A]/35 shadow-sm'
                  : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/5'
              }`}
            >
              <Star size={15} weight="bold" />
              <span>Give Feedback</span>
            </button>
          </div>

          {/* ========================================================
              TAB 1: SMART BOT & LIVE AGENT ESCALATION (FUNDING PIPS)
              ======================================================== */}
          {activeTab === 'bot' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#070B09]/70 overflow-hidden">
              {/* Chat Messages Stream */}
              <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-2.5 font-sans text-xs overscroll-contain">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-[#D9C08A]/20 border border-[#D9C08A]/35 text-[#D9C08A] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Robot size={13} weight="bold" />
                      </div>
                    )}
                    <div
                      className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line text-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#34D399]/20 text-[#F4F7F5] border border-[#34D399]/35 rounded-tr-xs shadow-xs'
                          : 'bg-[#131E1A] text-[#F4F7F5] border border-white/10 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.text}
                      <span className="block text-[9px] text-[#9EABA2]/70 text-right mt-1 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 items-center text-[#9EABA2] text-[11px] font-mono pl-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A] animate-bounce [animation-delay:0.4s]" />
                    <span>Assistant researching answer...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Live Escalation Banner / Form */}
              {showLiveEscalation && (
                <div className="p-3 mx-3 mb-2 rounded-xl bg-[#D9C08A]/10 border border-[#D9C08A]/35 text-xs text-[#F4F7F5] space-y-2 animate-in fade-in duration-200 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#D9C08A] font-bold">
                      <Headset size={15} weight="bold" />
                      <span>Live Agent Priority Escalation</span>
                    </div>
                    <button
                      onClick={() => setShowLiveEscalation(false)}
                      className="text-[#9EABA2] hover:text-[#F4F7F5] p-0.5"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#9EABA2]">
                    Provide your contact info so our live agent can assist you immediately:
                  </p>
                  <form onSubmit={handleEscalateToLiveAgent} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="email"
                        required
                        value={escalateEmail}
                        onChange={(e) => setEscalateEmail(e.target.value)}
                        placeholder="Your Email"
                        className="px-2.5 py-1.5 rounded-lg bg-[#070B09] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
                      />
                      <input
                        type="tel"
                        value={escalatePhone}
                        onChange={(e) => setEscalatePhone(e.target.value)}
                        placeholder="WhatsApp / Phone"
                        className="px-2.5 py-1.5 rounded-lg bg-[#070B09] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isEscalating}
                      className="w-full py-2 rounded-lg bg-[#D9C08A] text-[#070B09] font-bold text-xs uppercase tracking-wider hover:bg-[#E5CE9F] transition-all disabled:opacity-50"
                    >
                      {isEscalating ? 'Connecting Agent...' : 'Confirm Live Agent Ticket'}
                    </button>
                  </form>
                </div>
              )}

              {/* ========================================================
                  KNOWLEDGE BASE QUICK CHIPS (NO CLIPPING, FULL PADDING)
                  ======================================================== */}
              <div className="px-3 py-2 border-t border-white/5 bg-[#0D1512]/90 flex items-center gap-2 overflow-x-auto scrollbar-none overscroll-x-contain shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage('How do Rank criteria and bonuses work?')}
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 hover:border-[#D9C08A]/40 border border-white/10 text-[11px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>👑</span>
                  <span>Ranks</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('What are payout times and methods?')}
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 hover:border-[#D9C08A]/40 border border-white/10 text-[11px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>💰</span>
                  <span>Payouts</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('How does wholesale COD selling work?')}
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 hover:border-[#D9C08A]/40 border border-white/10 text-[11px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>📦</span>
                  <span>COD Selling</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Where are training video tutorials?')}
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 hover:border-[#D9C08A]/40 border border-white/10 text-[11px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1 active:scale-95"
                >
                  <span>🎓</span>
                  <span>Tutorials</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSendMessage('I want to chat with a live agent');
                    setShowLiveEscalation(true);
                  }}
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full bg-[#D9C08A]/20 border border-[#D9C08A]/50 text-[11px] text-[#D9C08A] font-bold hover:bg-[#D9C08A]/30 transition-all flex items-center gap-1 active:scale-95 shadow-xs"
                >
                  <Headset size={13} weight="bold" />
                  <span>Live Agent</span>
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-2.5 sm:p-3 border-t border-white/10 bg-[#090F0C] shrink-0 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type question or ask for live agent..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A] focus:ring-1 focus:ring-[#D9C08A]/40 transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D9C08A] text-[#070B09] flex items-center justify-center hover:bg-[#E5CE9F] disabled:opacity-40 disabled:hover:bg-[#D9C08A] active:scale-95 transition-all shrink-0"
                  aria-label="Send Message"
                >
                  <PaperPlaneRight size={15} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: ADVANCED USER FEEDBACK FORM
              ======================================================== */}
          {activeTab === 'feedback' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 bg-[#070B09]/70 font-sans space-y-3.5 overscroll-contain">
              {feedbackSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-2xl bg-[#34D399]/20 border border-[#34D399]/40 text-[#34D399] flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.25)]">
                    <CheckCircle size={28} weight="bold" />
                  </div>
                  <h4 className="text-sm sm:text-base font-bold font-serif text-[#F4F7F5]">
                    Feedback Received!
                  </h4>
                  <p className="text-xs text-[#9EABA2] max-w-xs leading-relaxed">
                    Thank you for helping us elevate Dream to Achievers. Your insights have been delivered to administrators.
                  </p>
                  <button
                    onClick={() => {
                      setFeedbackSuccess(false);
                      setFeedbackMessage('');
                      setSubject('');
                    }}
                    className="px-4 py-2 mt-2 rounded-xl bg-[#D9C08A]/20 border border-[#D9C08A]/40 text-[#D9C08A] font-bold text-xs uppercase tracking-wider hover:bg-[#D9C08A]/30 transition-all"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
                  {/* Star Rating */}
                  <div className="space-y-1 text-center">
                    <label className="text-[10px] font-bold text-[#9EABA2] uppercase tracking-wider">
                      Rate Your Overall Experience
                    </label>
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled = starVal <= (hoverRating || rating);
                        return (
                          <button
                            type="button"
                            key={starVal}
                            onClick={() => setRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                            aria-label={`Rate ${starVal} stars`}
                          >
                            <Star
                              size={26}
                              weight={isFilled ? 'fill' : 'regular'}
                              className={isFilled ? 'text-[#D9C08A] drop-shadow-[0_0_8px_rgba(217,192,138,0.5)]' : 'text-[#9EABA2]/35'}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="block text-[11px] font-mono font-medium text-[#D9C08A]">
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  </div>

                  {/* Category Pills */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#9EABA2] uppercase tracking-wider">
                      Feedback Type
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['ux', 'feature', 'bug', 'general'] as FeedbackCategory[]).map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            category === cat
                              ? 'bg-[#D9C08A]/20 border-[#D9C08A] text-[#D9C08A] font-bold shadow-xs'
                              : 'bg-[#131E1A] border-white/5 text-[#9EABA2] hover:text-[#F4F7F5]'
                          }`}
                        >
                          {categoryIcons[cat]}
                          <span className="capitalize">{cat === 'ux' ? 'UI / Design' : cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Title (e.g. Navigation speed, Idea for rewards...)"
                      className="w-full px-3 py-2 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]"
                    />
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-1">
                    <textarea
                      required
                      rows={3}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Share your suggestions, issues, or thoughts..."
                      className="w-full px-3 py-2 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A] resize-none"
                    />
                  </div>

                  {/* Contact info */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Name (optional)"
                      className="px-3 py-2 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
                    />
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackMessage.trim() || !userEmail.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D9C08A] to-[#BFA168] text-[#070B09] font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-[0_0_20px_rgba(217,192,138,0.25)] active:scale-[0.99] transition-all disabled:opacity-40"
                  >
                    {isSubmittingFeedback ? 'Submitting...' : 'Submit to Admin Desk'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
