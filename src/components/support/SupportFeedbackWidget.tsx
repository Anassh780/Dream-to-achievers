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
  LockKey,
  BellRinging,
  User as UserIcon,
} from '@phosphor-icons/react';

export const SupportFeedbackWidget: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Widget visibility state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bot' | 'feedback'>('bot');
  const modalRef = useRef<HTMLDivElement>(null);

  // Active Live Chat Ticket ID for continuous real-time admin sync
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [isLiveAgentRequested, setIsLiveAgentRequested] = useState(false);

  // --- BOT CHAT STATE ---
  const [messages, setMessages] = useState<SupportChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: `Hello ${user?.fullName || 'there'}! Welcome to Dream to Achievers Live Desk. Ask me anything about Ranks, Payouts, COD Selling, or click "Live Agent" to call an admin.`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- FEEDBACK FORM STATE (No Email Field - Auto Dispatched) ---
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>('ux');
  const [subject, setSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (activeTab === 'bot' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, activeTab]);

  // Sync ticket messages from admin replies in real time
  useEffect(() => {
    if (!activeTicketId) return;

    const syncLiveTicket = () => {
      const ticket = feedbackService.getTicketById(activeTicketId);
      if (ticket && ticket.messages && ticket.messages.length > 0) {
        setMessages(ticket.messages);
      }
    };

    window.addEventListener('dta_support_update', syncLiveTicket);
    return () => window.removeEventListener('dta_support_update', syncLiveTicket);
  }, [activeTicketId]);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        // Only close if not clicking the toggle button
        const toggleBtn = document.getElementById('support-float-toggle');
        if (toggleBtn && toggleBtn.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 120);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Trigger Immediate Live Agent Escalation with Admin Bell Notification (NO EMAIL/WHATSAPP FORM NEEDED)
  const handleConnectLiveAgent = async (userNote?: string) => {
    setIsLiveAgentRequested(true);

    const userName = user?.fullName || 'Online User';
    const userEmail = user?.email || 'support@dreamtoachievers.com';
    const initialText = userNote || inputText.trim() || 'User requested to chat with a live agent.';

    const userMsg: SupportChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userNote || (inputText.trim() ? inputText.trim() : 'I would like to speak with a live agent.'),
      timestamp: new Date().toISOString(),
    };

    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInputText('');

    try {
      // Create ticket directly and dispatch Bell Notification to all admins
      const ticket = await feedbackService.createTicket({
        userId: user?.id,
        userName,
        userEmail,
        whatsapp: user?.phone || '',
        subject: `Live Support Request: ${initialText.substring(0, 45)}`,
        category: 'live_desk',
        priority: 'urgent',
        messages: allMsgs,
      });

      setActiveTicketId(ticket.id);

      // Post instant confirmation to user
      setTimeout(() => {
        const botReply: SupportChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: `🔔 **Live Agent Alerted!**\nA high-priority bell notification has been dispatched to all platform administrators. An admin will join this live chat shortly.\n\nPlease type your question below — an agent will reply directly here!`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botReply]);
        feedbackService.addMessageToTicket(ticket.id, {
          sender: 'bot',
          text: botReply.text,
        });
      }, 400);
    } catch (err) {
      console.error('Failed to connect live agent:', err);
    }
  };

  // Send message to Bot or Active Live Chat Session
  const handleSendMessage = async (textToSend?: string) => {
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

    // If active ticket exists, append to ticket so admin sees it in real time
    if (activeTicketId) {
      feedbackService.addMessageToTicket(activeTicketId, {
        sender: 'user',
        text,
      });
      return;
    }

    // Check if user is asking for live agent
    const clean = text.toLowerCase();
    const isAskingForAgent = [
      'live agent',
      'agent',
      'human',
      'representative',
      'chat with live',
      'real person',
      'talk to someone',
      'admin',
    ].some((k) => clean.includes(k));

    if (isAskingForAgent) {
      handleConnectLiveAgent(text);
      return;
    }

    // Otherwise, generate intelligent bot answer
    setIsTyping(true);
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
        handleConnectLiveAgent(text);
      }
    }, 450);
  };

  // Submit Feedback Form (Automatically routed to official email without showing email input)
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const sentiment = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';
      await feedbackService.submitFeedback({
        userId: user?.id,
        userName: user?.fullName || 'Anonymous Reseller',
        // Auto-routed to official email without requiring user to fill email
        userEmail: user?.email || 'support@dreamtoachievers.com',
        rating,
        category,
        sentiment,
        subject: subject.trim() || `${category.toUpperCase()} User Feedback`,
        message: feedbackMessage.trim(),
        pageUrl: location.pathname,
        deviceInfo:
          typeof navigator !== 'undefined'
            ? `${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}`
            : 'Web',
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
    ux: <Palette size={14} weight="bold" />,
    feature: <Lightbulb size={14} weight="bold" />,
    bug: <Bug size={14} weight="bold" />,
    support: <Headset size={14} weight="bold" />,
    general: <ThumbsUp size={14} weight="bold" />,
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[85] bg-black/50 backdrop-blur-[2px] sm:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ========================================================
          FLOATING ACTION LAUNCHER & TOGGLE BUTTON
          - Always visible
          - When open: becomes a clear, glowing Close (✕) button!
          ======================================================== */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[90] flex items-center">
        <button
          id="support-float-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close Support' : 'Open Live Support and Feedback'}
          className={`group relative flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 rounded-full border transition-all duration-300 shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-[#D9C08A]/60 active:scale-95 ${
            isOpen
              ? 'bg-[#18231E] border-rose-500/60 text-rose-300 hover:bg-rose-950/40'
              : 'bg-[#0D1512]/95 hover:bg-[#131E1A] border-[#D9C08A]/45 text-[#F4F7F5]'
          }`}
        >
          {/* Ambient Glow */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#D9C08A]/30 via-[#34D399]/30 to-[#D9C08A]/30 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />

          {isOpen ? (
            // Close State
            <div className="relative z-10 flex items-center gap-1.5 font-sans font-bold text-xs text-rose-300">
              <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <X size={15} weight="bold" />
              </div>
              <span className="font-serif">Close</span>
            </div>
          ) : (
            // Open State
            <div className="relative z-10 flex items-center gap-2">
              <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#D9C08A]/20 border border-[#D9C08A]/50 text-[#D9C08A] shrink-0">
                <Headset size={16} weight="bold" className="animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#34D399] border-2 border-[#070B09]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[11px] sm:text-xs font-bold tracking-wide text-[#F4F7F5] flex items-center gap-1 font-serif whitespace-nowrap">
                  Support & Feedback
                </span>
                <span className="text-[9px] text-[#34D399] font-medium tracking-wider uppercase font-mono">
                  ● Live 24/7 Desk
                </span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* ========================================================
          EXPANDABLE MODAL PANEL
          - Placed above the launcher (bottom-16 sm:bottom-20)
          - Adaptive height (no empty space void!)
          - Header bar has a prominent Close (✕) button
          ======================================================== */}
      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Customer Support and Feedback"
          className="fixed bottom-14 sm:bottom-20 right-3 sm:right-5 z-[90] w-[calc(100vw-24px)] sm:w-[385px] md:w-[400px] flex flex-col rounded-2xl bg-[#090F0C] border border-[#D9C08A]/35 text-[#F4F7F5] shadow-[0_25px_65px_rgba(0,0,0,0.9),0_0_30px_rgba(217,192,138,0.15)] backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Subtle Accent Glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 w-36 h-36 bg-[radial-gradient(circle,rgba(217,192,138,0.18),transparent_70%)] blur-2xl -z-10" />

          {/* ========================================================
              TOP HEADER BAR (PROMINENT CLOSE BUTTON)
              ======================================================== */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#D9C08A]/20 bg-[#0D1512] shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-[#D9C08A]/20 border border-[#D9C08A]/40 text-[#D9C08A] shrink-0">
                <Robot size={16} weight="bold" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#34D399] border-2 border-[#0D1512]" />
              </div>
              <div>
                <h3 className="text-xs font-bold font-serif text-[#F4F7F5] flex items-center gap-1.5 leading-tight">
                  Dream Support Desk
                  <ShieldCheck size={13} weight="fill" className="text-[#34D399]" />
                </h3>
                <p className="text-[9px] text-[#9EABA2] font-mono leading-tight">
                  {isLiveAgentRequested ? '🚨 Live Agent Alerted' : '● Online | Smart AI & Live Desk'}
                </p>
              </div>
            </div>

            {/* Clear, Prominent Header Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-rose-500/20 text-[#9EABA2] hover:text-rose-300 border border-white/5 transition-all active:scale-90"
              title="Close window"
              aria-label="Close Support Window"
            >
              <X size={15} weight="bold" />
            </button>
          </div>

          {/* ========================================================
              NAVIGATION TABS
              ======================================================== */}
          <div className="grid grid-cols-2 p-1 bg-[#070B09] border-b border-white/5 shrink-0 text-xs">
            <button
              onClick={() => setActiveTab('bot')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'bot'
                  ? 'bg-[#D9C08A]/20 text-[#D9C08A] border border-[#D9C08A]/35 shadow-xs'
                  : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/5'
              }`}
            >
              <ChatCircleDots size={14} weight="bold" />
              <span>Ask AI / Live Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'feedback'
                  ? 'bg-[#D9C08A]/20 text-[#D9C08A] border border-[#D9C08A]/35 shadow-xs'
                  : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/5'
              }`}
            >
              <Star size={14} weight="bold" />
              <span>Give Feedback</span>
            </button>
          </div>

          {/* ========================================================
              TAB 1: LIVE BOT & INSTANT ADMIN BELL ESCALATION
              ======================================================== */}
          {activeTab === 'bot' && (
            <div className="flex flex-col bg-[#070B09]/80 overflow-hidden">
              {/* Chat Message Stream - Clean, compact max height (No large blank void!) */}
              <div className="min-h-[160px] max-h-[250px] overflow-y-auto p-3 space-y-2.5 font-sans text-xs overscroll-contain">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender !== 'user' && (
                      <div className="w-5 h-5 rounded-md bg-[#D9C08A]/20 border border-[#D9C08A]/35 text-[#D9C08A] flex items-center justify-center shrink-0 mt-0.5">
                        <Robot size={12} weight="bold" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 leading-relaxed whitespace-pre-line text-xs ${
                        msg.sender === 'user'
                          ? 'bg-[#34D399]/20 text-[#F4F7F5] border border-[#34D399]/35 rounded-tr-xs'
                          : msg.sender === 'agent'
                          ? 'bg-[#D9C08A]/25 text-[#F4F7F5] border border-[#D9C08A]/50 rounded-tl-xs'
                          : 'bg-[#131E1A] text-[#F4F7F5] border border-white/10 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                      <span className="block text-[8px] text-[#9EABA2]/60 text-right mt-0.5 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-1.5 items-center text-[#9EABA2] text-[10px] font-mono pl-7">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D9C08A] animate-bounce [animation-delay:0.4s]" />
                    <span>Finding answer...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Knowledge Base Chips */}
              <div className="px-3 py-1.5 border-t border-white/5 bg-[#0D1512]/90 flex items-center gap-1.5 overflow-x-auto scrollbar-none overscroll-x-contain shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendMessage('How do Rank criteria and bonuses work?')}
                  className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 border border-white/10 text-[10px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1"
                >
                  <span>👑 Ranks</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('What are payout times and methods?')}
                  className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 border border-white/10 text-[10px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1"
                >
                  <span>💰 Payouts</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('How does wholesale COD selling work?')}
                  className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 border border-white/10 text-[10px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1"
                >
                  <span>📦 COD Selling</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage('Where are training video tutorials?')}
                  className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#D9C08A]/15 border border-white/10 text-[10px] text-[#9EABA2] hover:text-[#D9C08A] transition-all flex items-center gap-1"
                >
                  <span>🎓 Tutorials</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleConnectLiveAgent()}
                  className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-[10px] text-rose-300 font-bold hover:bg-rose-500/30 transition-all flex items-center gap-1 active:scale-95"
                >
                  <BellRinging size={12} weight="bold" />
                  <span>Call Live Agent</span>
                </button>
              </div>

              {/* Chat Input Bar */}
              <div className="p-2 border-t border-white/10 bg-[#090F0C] shrink-0 flex items-center gap-1.5">
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
                  placeholder="Ask bot or type message for admin..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A] focus:ring-1 focus:ring-[#D9C08A]/40 transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim()}
                  className="w-8 h-8 rounded-xl bg-[#D9C08A] text-[#070B09] flex items-center justify-center hover:bg-[#E5CE9F] disabled:opacity-40 active:scale-95 transition-all shrink-0"
                  aria-label="Send Message"
                >
                  <PaperPlaneRight size={14} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: FEEDBACK FORM (NO EMAIL FIELD - AUTO DISPATCHED)
              ======================================================== */}
          {activeTab === 'feedback' && (
            <div className="p-4 bg-[#070B09]/80 font-sans space-y-3">
              {feedbackSuccess ? (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-150">
                  <div className="w-10 h-10 rounded-xl bg-[#34D399]/20 border border-[#34D399]/40 text-[#34D399] flex items-center justify-center shadow-sm">
                    <CheckCircle size={24} weight="bold" />
                  </div>
                  <h4 className="text-sm font-bold font-serif text-[#F4F7F5]">
                    Feedback Sent!
                  </h4>
                  <p className="text-[11px] text-[#9EABA2] max-w-xs leading-relaxed">
                    Dispatched directly to the Dream to Achievers official support desk and platform administrators.
                  </p>
                  <button
                    onClick={() => {
                      setFeedbackSuccess(false);
                      setFeedbackMessage('');
                      setSubject('');
                    }}
                    className="px-3.5 py-1.5 mt-1 rounded-xl bg-[#D9C08A]/20 border border-[#D9C08A]/40 text-[#D9C08A] font-bold text-[11px] uppercase tracking-wider hover:bg-[#D9C08A]/30 transition-all"
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-3">
                  {/* Star Rating */}
                  <div className="text-center space-y-0.5">
                    <label className="text-[9px] font-bold text-[#9EABA2] uppercase tracking-wider block">
                      How was your experience?
                    </label>
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => {
                        const isFilled = starVal <= (hoverRating || rating);
                        return (
                          <button
                            type="button"
                            key={starVal}
                            onClick={() => setRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-120 focus:outline-none"
                            aria-label={`Rate ${starVal} stars`}
                          >
                            <Star
                              size={22}
                              weight={isFilled ? 'fill' : 'regular'}
                              className={
                                isFilled
                                  ? 'text-[#D9C08A] drop-shadow-[0_0_6px_rgba(217,192,138,0.5)]'
                                  : 'text-[#9EABA2]/30'
                              }
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="block text-[10px] font-mono text-[#D9C08A]">
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  </div>

                  {/* Category Pills */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#9EABA2] uppercase tracking-wider block">
                      Category
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['ux', 'feature', 'bug', 'general'] as FeedbackCategory[]).map((cat) => (
                        <button
                          type="button"
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
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

                  {/* Message Textarea */}
                  <div className="space-y-1">
                    <textarea
                      required
                      rows={3}
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Write your feedback, feature idea, or issue..."
                      className="w-full px-3 py-2 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A] resize-none"
                    />
                  </div>

                  {/* Reassurance Badge: Auto-sent to official email (NO EMAIL INPUT NEEDED) */}
                  <div className="p-2 rounded-lg bg-[#34D399]/10 border border-[#34D399]/20 flex items-center gap-2 text-[10px] text-[#34D399] font-mono">
                    <LockKey size={13} weight="bold" className="shrink-0" />
                    <span>Auto-dispatched to official desk: support@dreamtoachievers.com</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingFeedback || !feedbackMessage.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D9C08A] to-[#BFA168] text-[#070B09] font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md active:scale-[0.99] transition-all disabled:opacity-40"
                  >
                    {isSubmittingFeedback ? 'Sending...' : 'Send Feedback'}
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
