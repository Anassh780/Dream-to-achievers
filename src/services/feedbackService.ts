import { db } from '@/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, updateDoc } from 'firebase/firestore';
import { storage } from './storage';
import { auditService } from './auditService';
import type {
  UserFeedback,
  FeedbackCategory,
  FeedbackStatus,
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportChatMessage,
} from '@/types';

// Pre-seeded initial mock feedbacks for immediate admin preview if empty
const INITIAL_FEEDBACKS: UserFeedback[] = [
  {
    id: 'fb-seed-1',
    userName: 'Hamza Tariq',
    userEmail: 'hamza.trader@gmail.com',
    rating: 5,
    category: 'ux',
    sentiment: 'positive',
    subject: 'Liquid glass dark theme looks incredible',
    message: 'The new dashboard layout and rank progression tracker are visually stunning! Reminds me of top prop trading platforms like Funding Pips. Payout speeds are top notch.',
    pageUrl: '/dashboard/ranks',
    deviceInfo: 'Desktop - Chrome (Windows)',
    status: 'reviewed',
    adminNotes: 'User praised the UI modernization. Retained as loyal reseller.',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: 'fb-seed-2',
    userName: 'Ayesha Malik',
    userEmail: 'ayesha.m@outlook.com',
    rating: 4,
    category: 'feature',
    sentiment: 'positive',
    subject: 'Request: WhatsApp notification on direct customer delivery',
    message: 'Could you please add automated WhatsApp SMS alerts when our customer receives the COD parcel? That would save us lots of time checking tracking numbers.',
    pageUrl: '/dashboard/sales',
    deviceInfo: 'Mobile - Safari (iOS)',
    status: 'new',
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 'fb-seed-3',
    userName: 'Zubair Ahmed',
    userEmail: 'zubair.ahmed99@gmail.com',
    rating: 5,
    category: 'general',
    sentiment: 'positive',
    subject: 'Diamond rank reached and bonus received!',
    message: 'Alhamdulillah received my bonus directly into Bank account within 24 hours. The community support is phenomenal.',
    pageUrl: '/ranks',
    deviceInfo: 'Mobile - Chrome (Android)',
    status: 'resolved',
    adminNotes: 'Bonus verified and processed by admin.',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// Pre-seeded initial support tickets
const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-seed-1',
    userName: 'Bilal Khan',
    userEmail: 'bilal.khan@gmail.com',
    whatsapp: '+92 300 1234567',
    subject: 'Inquiry regarding JazzCash Payout time',
    category: 'payouts',
    status: 'open',
    priority: 'medium',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Assalam o Alaikum, I requested a withdrawal yesterday. When can I expect it in my JazzCash wallet?',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      },
      {
        id: 'msg-2',
        sender: 'bot',
        text: 'Walaikum Assalam! JazzCash and EasyPaisa withdrawals are routinely audited and dispatched within 24 to 48 business hours.',
        timestamp: new Date(Date.now() - 3600000 * 8 + 5000).toISOString(),
      },
      {
        id: 'msg-3',
        sender: 'user',
        text: 'I would like to speak with a live agent to double check my account number.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

class FeedbackService {
  // ==========================================
  // FEEDBACK MANAGEMENT
  // ==========================================

  public getAllFeedbacks(): UserFeedback[] {
    const list = storage.get<UserFeedback[]>('FEEDBACKS', INITIAL_FEEDBACKS);
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async submitFeedback(
    input: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>
  ): Promise<UserFeedback> {
    const id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newFeedback: UserFeedback = {
      ...input,
      id,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    const current = this.getAllFeedbacks();
    const updated = [newFeedback, ...current];
    storage.set('FEEDBACKS', updated);

    // Sync to Firestore in background
    try {
      await setDoc(doc(db, 'feedbacks', id), newFeedback);
    } catch (err) {
      console.warn('Firestore feedback write fallback to local storage:', err);
    }

    // Dispatch global event for badge counters and UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_feedback_update'));
    }

    return newFeedback;
  }

  public async updateFeedbackStatus(
    id: string,
    status: FeedbackStatus,
    adminNotes?: string
  ): Promise<UserFeedback | null> {
    const current = this.getAllFeedbacks();
    const index = current.findIndex((f) => f.id === id);
    if (index === -1) return null;

    const updatedItem: UserFeedback = {
      ...current[index],
      status,
      adminNotes: adminNotes !== undefined ? adminNotes : current[index].adminNotes,
      updatedAt: new Date().toISOString(),
    };

    current[index] = updatedItem;
    storage.set('FEEDBACKS', current);

    try {
      await updateDoc(doc(db, 'feedbacks', id), {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        updatedAt: updatedItem.updatedAt,
      });
    } catch (err) {
      console.warn('Firestore feedback status update fallback to local storage:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_feedback_update'));
    }

    return updatedItem;
  }

  public async deleteFeedback(id: string): Promise<boolean> {
    const current = this.getAllFeedbacks();
    const filtered = current.filter((f) => f.id !== id);
    storage.set('FEEDBACKS', filtered);

    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (err) {
      console.warn('Firestore feedback delete fallback:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_feedback_update'));
    }

    return true;
  }

  // ==========================================
  // SUPPORT TICKETS & CHAT
  // ==========================================

  public getAllTickets(): SupportTicket[] {
    const list = storage.get<SupportTicket[]>('SUPPORT_TICKETS', INITIAL_TICKETS);
    return [...list].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  }

  public getTicketById(id: string): SupportTicket | undefined {
    return this.getAllTickets().find((t) => t.id === id);
  }

  public async createTicket(
    input: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<SupportTicket> {
    const id = `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      ...input,
      id,
      status: 'waiting_agent',
      createdAt: now,
      updatedAt: now,
    };

    const current = this.getAllTickets();
    const updated = [newTicket, ...current];
    storage.set('SUPPORT_TICKETS', updated);

    try {
      await setDoc(doc(db, 'support_tickets', id), newTicket);
    } catch (err) {
      console.warn('Firestore ticket write fallback to local storage:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_support_update'));
    }

    return newTicket;
  }

  public async addMessageToTicket(
    ticketId: string,
    message: { sender: 'user' | 'bot' | 'agent'; text: string }
  ): Promise<SupportTicket | null> {
    const current = this.getAllTickets();
    const index = current.findIndex((t) => t.id === ticketId);
    if (index === -1) return null;

    const newMessage: SupportChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      sender: message.sender,
      text: message.text,
      timestamp: new Date().toISOString(),
    };

    const updatedTicket: SupportTicket = {
      ...current[index],
      messages: [...current[index].messages, newMessage],
      updatedAt: new Date().toISOString(),
      // If user messaged, set to waiting agent unless resolved
      status: message.sender === 'user' ? 'waiting_agent' : current[index].status,
    };

    current[index] = updatedTicket;
    storage.set('SUPPORT_TICKETS', current);

    try {
      await setDoc(doc(db, 'support_tickets', ticketId), updatedTicket, { merge: true });
    } catch (err) {
      console.warn('Firestore ticket message fallback:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_support_update'));
    }

    return updatedTicket;
  }

  public async updateTicketStatus(
    ticketId: string,
    status: SupportTicketStatus,
    priority?: SupportTicketPriority
  ): Promise<SupportTicket | null> {
    const current = this.getAllTickets();
    const index = current.findIndex((t) => t.id === ticketId);
    if (index === -1) return null;

    const updatedTicket: SupportTicket = {
      ...current[index],
      status,
      priority: priority || current[index].priority,
      updatedAt: new Date().toISOString(),
    };

    current[index] = updatedTicket;
    storage.set('SUPPORT_TICKETS', current);

    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        status,
        ...(priority ? { priority } : {}),
        updatedAt: updatedTicket.updatedAt,
      });
    } catch (err) {
      console.warn('Firestore ticket status fallback:', err);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('dta_support_update'));
    }

    return updatedTicket;
  }

  // ==========================================
  // FUNDING PIPS STYLE INTELLIGENT BOT ENGINE
  // ==========================================

  public getBotResponse(
    query: string,
    userName?: string
  ): {
    answer: string;
    suggestedChips: string[];
    isLiveAgentRequest: boolean;
  } {
    const clean = query.toLowerCase().trim();

    // Check for live agent requests
    const agentTriggers = [
      'live agent',
      'agent',
      'human',
      'representative',
      'chat with human',
      'real person',
      'support agent',
      'call',
      'talk to someone',
      'admin',
      'help desk agent',
    ];
    if (agentTriggers.some((t) => clean.includes(t))) {
      return {
        answer: `I am connecting you with our VIP Support Desk. Our team is available 24/7. Click the **"Escalate to Live Agent"** button below or leave your email/WhatsApp to initiate instant live handling.`,
        suggestedChips: ['Connect to Live Agent', 'Check Ranks', 'Ask about Payouts'],
        isLiveAgentRequest: true,
      };
    }

    // Rank & Progression
    if (clean.includes('rank') || clean.includes('tier') || clean.includes('silver') || clean.includes('gold') || clean.includes('diamond') || clean.includes('platinum')) {
      return {
        answer: `Dream to Achievers has 4 elite career ranks:\n\n• **Silver Achiever**: 10 Qualifying Sales, Rs 2,500 Cash Reward.\n• **Platinum Achiever**: 25 Sales + 5 Community Partners, Rs 7,500 Cash Reward.\n• **Gold Leader**: 50 Sales + 15 Community Partners, Rs 20,000 Cash Reward.\n• **Diamond Executive**: 100 Sales + 35 Community Partners, Rs 50,000 Cash Reward + VIP Mentorship.\n\nAll rewards are unlocked automatically once milestones are validated!`,
        suggestedChips: ['How do payouts work?', 'View Tutorials', 'Talk to Live Agent'],
        isLiveAgentRequest: false,
      };
    }

    // Payouts & Withdrawals
    if (clean.includes('payout') || clean.includes('withdraw') || clean.includes('money') || clean.includes('jazzcash') || clean.includes('easypaisa') || clean.includes('bank') || clean.includes('earnings')) {
      return {
        answer: `Payouts are processed directly to your preferred account:\n\n• **Supported Gateways**: JazzCash, EasyPaisa, and Direct Pakistani Bank Wire Transfer (IBAN).\n• **Processing Timeline**: Dispatched within 24 to 48 business hours after request.\n• **Minimum Threshold**: Rs 1,000.\n\nYou can track and submit withdrawals anytime from your **User Dashboard → Payouts & Bonuses** tab!`,
        suggestedChips: ['How to check rank?', 'Order Delivery Policy', 'Talk to Live Agent'],
        isLiveAgentRequest: false,
      };
    }

    // Products & Selling / Dropshipping / COD
    if (clean.includes('product') || clean.includes('sell') || clean.includes('order') || clean.includes('cod') || clean.includes('wholesale') || clean.includes('shipping') || clean.includes('deliver')) {
      return {
        answer: `Our platform offers premium wholesale-priced apparel, smartwatches, and luxury accessories with Cash on Delivery (COD) across Pakistan:\n\n1. Browse high-margin inventory from the **Products Catalog**.\n2. Share images and details with your buyers via WhatsApp, TikTok, or Instagram.\n3. Submit customer orders in your **Dashboard → Submit Order**.\n4. We deliver to your customer via courier COD, collect payment, and credit your profit margin instantly upon delivery!`,
        suggestedChips: ['View Product Catalog', 'Video Tutorials', 'Talk to Live Agent'],
        isLiveAgentRequest: false,
      };
    }

    // Tutorials & Training
    if (clean.includes('tutorial') || clean.includes('guide') || clean.includes('video') || clean.includes('learn') || clean.includes('training') || clean.includes('how to start')) {
      return {
        answer: `We provide complete step-by-step video masterclasses:\n\n• **Getting Started**: How to setup your reseller profile & affiliate links.\n• **Social Selling Masterclass**: Finding buyers on TikTok, Reels & WhatsApp.\n• **Order Management**: How to book COD parcels with 0 delivery hassle.\n\nVisit our public **Tutorials & Academy** section in the main navigation!`,
        suggestedChips: ['Go to Tutorials', 'How do ranks work?', 'Talk to Live Agent'],
        isLiveAgentRequest: false,
      };
    }

    // Founder / Office / About
    if (clean.includes('founder') || clean.includes('faria') || clean.includes('company') || clean.includes('office') || clean.includes('contact') || clean.includes('whatsapp')) {
      return {
        answer: `Dream to Achievers is founded by **Faria Imran**, dedicated to empowering independent entrepreneurs, students, and women across Pakistan through verified e-commerce reseller programs.\n\n• Official WhatsApp Support: Available on our Contact Page.\n• Support Email: **support@dreamtoachievers.com**`,
        suggestedChips: ['Contact Page', 'How to get started', 'Talk to Live Agent'],
        isLiveAgentRequest: false,
      };
    }

    // Default polite response
    const greeting = userName ? `Hello ${userName}!` : 'Hello!';
    return {
      answer: `${greeting} Thank you for contacting Dream to Achievers Support. I can guide you with Rank criteria, Payout withdrawals, Product wholesale ordering, and Video tutorials. You can also request a live agent at any moment!`,
      suggestedChips: ['👑 Rank Rewards', '💰 Payout Timelines', '📦 How COD Selling Works', '👤 Talk to Live Agent'],
      isLiveAgentRequest: false,
    };
  }

  // Count unreviewed items for Admin badges
  public getPendingFeedbackCount(): number {
    return this.getAllFeedbacks().filter((f) => f.status === 'new').length;
  }

  public getPendingTicketsCount(): number {
    return this.getAllTickets().filter((t) => t.status === 'waiting_agent' || t.status === 'open').length;
  }
}

export const feedbackService = new FeedbackService();
