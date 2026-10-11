import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { feedbackService } from '@/services/feedbackService';
import type {
  UserFeedback,
  FeedbackCategory,
  FeedbackStatus,
  SupportTicket,
  SupportTicketStatus,
  SupportTicketPriority,
} from '@/types';
import {
  ChatCircleDots,
  Star,
  Headset,
  Bug,
  Lightbulb,
  Palette,
  ThumbsUp,
  CheckCircle,
  Clock,
  Trash,
  MagnifyingGlass,
  Funnel,
  DownloadSimple,
  Sparkle,
  PaperPlaneRight,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Envelope,
  ArrowSquareOut,
  WarningCircle,
  Tag,
  ArrowsClockwise,
  NotePencil,
  X,
} from '@phosphor-icons/react';

export const AdminFeedbackPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [activeTab, setActiveTab] = useState<'feedback' | 'tickets'>('feedback');
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(() => feedbackService.getAllFeedbacks());
  const [tickets, setTickets] = useState<SupportTicket[]>(() => feedbackService.getAllTickets());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');

  // Selected Ticket for Chat inspection / reply
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Selected Feedback for note editing
  const [selectedFeedbackForNote, setSelectedFeedbackForNote] = useState<UserFeedback | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Reload data
  const refreshData = () => {
    setFeedbacks(feedbackService.getAllFeedbacks());
    setTickets(feedbackService.getAllTickets());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener('dta_feedback_update', handleUpdate);
    window.addEventListener('dta_support_update', handleUpdate);
    return () => {
      window.removeEventListener('dta_feedback_update', handleUpdate);
      window.removeEventListener('dta_support_update', handleUpdate);
    };
  }, []);

  // Compute Metrics
  const stats = useMemo(() => {
    const totalFeedbacks = feedbacks.length;
    const avgRating =
      totalFeedbacks > 0
        ? (feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / totalFeedbacks).toFixed(1)
        : '0.0';

    const pendingFeedbacks = feedbacks.filter((f) => f.status === 'new').length;
    const openTickets = tickets.filter((t) => t.status === 'waiting_agent' || t.status === 'open').length;
    const resolvedTotal =
      feedbacks.filter((f) => f.status === 'resolved').length +
      tickets.filter((t) => t.status === 'resolved').length;
    const totalItems = feedbacks.length + tickets.length;
    const resolutionRate = totalItems > 0 ? Math.round((resolvedTotal / totalItems) * 100) : 100;

    return {
      totalFeedbacks,
      avgRating,
      pendingFeedbacks,
      openTickets,
      resolutionRate,
    };
  }, [feedbacks, tickets]);

  // Filtered Feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      const matchSearch =
        !searchQuery ||
        f.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || f.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || f.status === selectedStatus;
      const matchRating = selectedRating === 'all' || f.rating === Number(selectedRating);

      return matchSearch && matchCategory && matchStatus && matchRating;
    });
  }, [feedbacks, searchQuery, selectedCategory, selectedStatus, selectedRating]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.whatsapp?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [tickets, searchQuery, selectedStatus]);

  // Feedback Actions
  const handleUpdateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
    try {
      await feedbackService.updateFeedbackStatus(id, status);
      toastSuccess(`Feedback status updated to ${status}.`);
      refreshData();
    } catch {
      toastError('Failed to update status.');
    }
  };

  const handleSaveAdminNote = async () => {
    if (!selectedFeedbackForNote) return;
    try {
      await feedbackService.updateFeedbackStatus(
        selectedFeedbackForNote.id,
        selectedFeedbackForNote.status,
        editingNoteText.trim()
      );
      toastSuccess('Internal administrative note saved.');
      setSelectedFeedbackForNote(null);
      refreshData();
    } catch {
      toastError('Failed to save note.');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback entry?')) return;
    try {
      await feedbackService.deleteFeedback(id);
      toastSuccess('Feedback removed.');
      refreshData();
    } catch {
      toastError('Failed to delete feedback.');
    }
  };

  // Ticket Actions
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReplyText.trim()) return;

    setIsSendingReply(true);
    try {
      await feedbackService.addMessageToTicket(selectedTicket.id, {
        sender: 'agent',
        text: adminReplyText.trim(),
      });
      await feedbackService.updateTicketStatus(selectedTicket.id, 'open');
      toastSuccess('Reply dispatched to ticket.');
      setAdminReplyText('');

      // Refresh local selected ticket
      const updated = feedbackService.getTicketById(selectedTicket.id);
      if (updated) setSelectedTicket(updated);
      refreshData();
    } catch {
      toastError('Failed to send reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateTicketStatus = async (id: string, status: SupportTicketStatus) => {
    try {
      await feedbackService.updateTicketStatus(id, status);
      toastSuccess(`Ticket marked as ${status}.`);
      if (selectedTicket?.id === id) {
        const updated = feedbackService.getTicketById(id);
        setSelectedTicket(updated || null);
      }
      refreshData();
    } catch {
      toastError('Failed to update ticket status.');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this chat history and ticket? This cannot be undone.')) return;
    try {
      await feedbackService.deleteTicket(id);
      toastSuccess('Support ticket and chat history deleted.');
      if (selectedTicket?.id === id) {
        setSelectedTicket(null);
      }
      refreshData();
    } catch {
      toastError('Failed to delete ticket.');
    }
  };

  // Export Data to CSV
  const handleExportCSV = () => {
    const dataToExport = feedbacks.map((f) => ({
      ID: f.id,
      User: f.userName,
      Email: f.userEmail,
      Rating: f.rating,
      Category: f.category,
      Status: f.status,
      Subject: f.subject,
      Message: f.message.replace(/"/g, '""'),
      Page: f.pageUrl,
      Date: f.createdAt,
    }));

    const headers = Object.keys(dataToExport[0] || {}).join(',');
    const rows = dataToExport.map((row) =>
      Object.values(row)
        .map((v) => `"${v}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dream_to_achievers_feedback_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toastSuccess('Feedback report downloaded as CSV.');
  };

  const categoryColor: Record<FeedbackCategory, string> = {
    ux: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    feature: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    bug: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    support: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    general: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ========================================================
          PAGE HEADER
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-[#D9C08A]/15 text-[#D9C08A] border border-[#D9C08A]/30">
              Community Voice & Help Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight mt-1">
            Customer Support & Feedback
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA2] mt-0.5">
            Monitor reseller satisfaction ratings, review feature ideas, and handle live agent escalation tickets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshData}
            className="funding-ghost-pill px-3.5 py-2 text-xs flex items-center gap-1.5"
            title="Refresh Data"
          >
            <ArrowsClockwise size={14} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="funding-ghost-pill px-3.5 py-2 text-xs flex items-center gap-1.5 text-[#D9C08A]"
            title="Download CSV"
          >
            <DownloadSimple size={14} weight="bold" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          KPI METRIC CARDS (FUNDING PIPS EXECUTIVE ROW)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Feedback */}
        <div className="funding-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9EABA2]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Feedbacks</span>
            <div className="w-8 h-8 rounded-lg bg-[#D9C08A]/15 border border-[#D9C08A]/30 flex items-center justify-center text-[#D9C08A]">
              <Star size={16} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5]">
              {stats.totalFeedbacks}
            </div>
            <div className="text-[11px] text-[#D9C08A] mt-1 flex items-center gap-1 font-mono">
              <Sparkle size={12} weight="fill" />
              <span>{stats.pendingFeedbacks} awaiting review</span>
            </div>
          </div>
        </div>

        {/* Avg Star Rating */}
        <div className="funding-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9EABA2]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Satisfaction Score</span>
            <div className="w-8 h-8 rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#34D399]">
              <ThumbsUp size={16} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] flex items-center gap-2">
              <span>{stats.avgRating}</span>
              <span className="text-sm font-sans text-[#D9C08A] flex items-center">
                ★ <span className="text-[#9EABA2] text-xs">/ 5.0</span>
              </span>
            </div>
            <div className="text-[11px] text-[#34D399] mt-1 font-mono">
              High Community Trust
            </div>
          </div>
        </div>

        {/* Live Support Inquiries */}
        <div className="funding-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9EABA2]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Live Agent Requests</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Headset size={16} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] flex items-center gap-2">
              <span>{stats.openTickets}</span>
              {stats.openTickets > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </div>
            <div className="text-[11px] text-rose-400 mt-1 font-mono">
              {stats.openTickets > 0 ? 'Urgent attention required' : 'All live tickets cleared'}
            </div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="funding-card p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9EABA2]">
            <span className="text-[11px] font-mono uppercase tracking-wider">Resolution Rate</span>
            <div className="w-8 h-8 rounded-lg bg-[#34D399]/15 border border-[#34D399]/30 flex items-center justify-center text-[#34D399]">
              <CheckCircle size={16} weight="bold" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5]">
              {stats.resolutionRate}%
            </div>
            <div className="text-[11px] text-[#9EABA2] mt-1 font-mono">
              Standard SLA &lt; 24h
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          NAVIGATION TABS (FEEDBACK vs SUPPORT TICKETS)
          ======================================================== */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-serif transition-all ${
            activeTab === 'feedback'
              ? 'bg-[#D9C08A]/20 text-[#D9C08A] border border-[#D9C08A]/40'
              : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/5'
          }`}
        >
          <Star size={16} weight="bold" />
          <span>User Feedback & Ratings ({feedbacks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-serif transition-all ${
            activeTab === 'tickets'
              ? 'bg-[#D9C08A]/20 text-[#D9C08A] border border-[#D9C08A]/40'
              : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/5'
          }`}
        >
          <Headset size={16} weight="bold" />
          <span>Live Support Desk ({tickets.length})</span>
          {stats.openTickets > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-mono font-bold">
              {stats.openTickets}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================
          SEARCH & FILTER CONTROLS
          ======================================================== */}
      <div className="funding-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'feedback'
                ? 'Search feedback by keyword, user, or email...'
                : 'Search support tickets by user, issue, or phone...'
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#070B09] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'feedback' && (
            <>
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#070B09] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
              >
                <option value="all">All Categories</option>
                <option value="ux">UI & Design</option>
                <option value="feature">Feature Idea</option>
                <option value="bug">Bug Report</option>
                <option value="general">General</option>
              </select>

              {/* Rating Filter */}
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#070B09] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars ★★★★★</option>
                <option value="4">4 Stars ★★★★☆</option>
                <option value="3">3 Stars ★★★☆☆</option>
                <option value="2">2 Stars ★★☆☆☆</option>
                <option value="1">1 Star ★☆☆☆☆</option>
              </select>
            </>
          )}

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#070B09] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
          >
            <option value="all">All Statuses</option>
            {activeTab === 'feedback' ? (
              <>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </>
            ) : (
              <>
                <option value="waiting_agent">Waiting Agent</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* ========================================================
          TAB 1: USER FEEDBACK CARDS & MANAGEMENT
          ======================================================== */}
      {activeTab === 'feedback' && (
        <div className="space-y-3">
          {filteredFeedbacks.length === 0 ? (
            <div className="funding-card p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9C08A]/10 border border-[#D9C08A]/25 flex items-center justify-center text-[#D9C08A] mx-auto">
                <Star size={24} />
              </div>
              <h3 className="text-base font-bold font-serif text-[#F4F7F5]">
                No Feedback Matches Your Criteria
              </h3>
              <p className="text-xs text-[#9EABA2] max-w-sm mx-auto">
                Try resetting search filters or encourage your users to share thoughts via the floating desk.
              </p>
            </div>
          ) : (
            filteredFeedbacks.map((f) => (
              <div
                key={f.id}
                className="funding-card p-5 space-y-4 hover:border-[#D9C08A]/35 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D9C08A]/20 to-[#34D399]/20 border border-white/10 flex items-center justify-center text-[#D9C08A] font-serif font-bold text-sm">
                      {f.userName ? f.userName[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F4F7F5]">{f.userName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase tracking-wider ${categoryColor[f.category]}`}>
                          {f.category === 'ux' ? 'UI / UX' : f.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#9EABA2] font-mono mt-0.5">
                        <span>{f.userEmail}</span>
                        <span>•</span>
                        <span>{new Date(f.createdAt).toLocaleString()}</span>
                        {f.pageUrl && (
                          <>
                            <span>•</span>
                            <span className="text-[#D9C08A]/80">Page: {f.pageUrl}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars & Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-[#D9C08A]">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          weight={s <= f.rating ? 'fill' : 'regular'}
                          className={s <= f.rating ? 'text-[#D9C08A]' : 'text-[#9EABA2]/30'}
                        />
                      ))}
                    </div>

                    <select
                      value={f.status}
                      onChange={(e) => handleUpdateFeedbackStatus(f.id, e.target.value as FeedbackStatus)}
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                        f.status === 'new'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : f.status === 'reviewed'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      <option value="new" className="bg-[#0D1512]">New</option>
                      <option value="reviewed" className="bg-[#0D1512]">Reviewed</option>
                      <option value="resolved" className="bg-[#0D1512]">Resolved</option>
                    </select>

                    <button
                      onClick={() => handleDeleteFeedback(f.id)}
                      className="p-1.5 rounded-lg text-[#9EABA2] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Feedback"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5 bg-[#070B09]/50 p-3.5 rounded-xl border border-white/5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#F4F7F5] font-serif">
                    {f.subject}
                  </h4>
                  <p className="text-xs text-[#9EABA2] leading-relaxed whitespace-pre-line">
                    {f.message}
                  </p>
                </div>

                {/* Admin Internal Notes Section */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <div className="text-[11px] text-[#9EABA2] flex items-center gap-1.5 font-mono">
                    <NotePencil size={14} className="text-[#D9C08A]" />
                    <span>
                      {f.adminNotes ? (
                        <span className="text-[#D9C08A]">Note: {f.adminNotes}</span>
                      ) : (
                        'No administrative note added yet'
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedFeedbackForNote(f);
                      setEditingNoteText(f.adminNotes || '');
                    }}
                    className="text-[11px] font-bold text-[#D9C08A] hover:underline flex items-center gap-1"
                  >
                    <span>{f.adminNotes ? 'Edit Note' : '+ Add Note'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: SUPPORT TICKETS & LIVE ESCALATIONS
          ======================================================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="funding-card p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9C08A]/10 border border-[#D9C08A]/25 flex items-center justify-center text-[#D9C08A] mx-auto">
                <Headset size={24} />
              </div>
              <h3 className="text-base font-bold font-serif text-[#F4F7F5]">
                No Live Support Inquiries
              </h3>
              <p className="text-xs text-[#9EABA2] max-w-sm mx-auto">
                All inquiries have been addressed! Any new "Talk to Live Agent" escalation will appear here instantly.
              </p>
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                className={`funding-card p-5 space-y-3 hover:border-[#D9C08A]/35 transition-all ${
                  t.status === 'waiting_agent' ? 'border-rose-500/35 bg-rose-500/[0.02]' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-[#D9C08A]/20 border border-white/10 flex items-center justify-center text-rose-400 font-bold">
                      <Headset size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F4F7F5]">{t.userName}</span>
                        {t.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider font-bold animate-pulse">
                            ● Urgent Live Request
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#9EABA2] font-mono mt-0.5">
                        <span>{t.userEmail}</span>
                        {t.whatsapp && (
                          <>
                            <span>•</span>
                            <span className="text-[#34D399]">WhatsApp: {t.whatsapp}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2.5">
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateTicketStatus(t.id, e.target.value as SupportTicketStatus)}
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                        t.status === 'waiting_agent'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : t.status === 'open'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      <option value="waiting_agent" className="bg-[#0D1512]">Waiting Agent</option>
                      <option value="open" className="bg-[#0D1512]">In Progress</option>
                      <option value="resolved" className="bg-[#0D1512]">Resolved</option>
                    </select>

                    <button
                      onClick={() => handleUpdateTicketStatus(t.id, t.status === 'resolved' ? 'open' : 'resolved')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          : 'bg-[#34D399]/15 text-[#34D399] border-[#34D399]/40 hover:bg-[#34D399]/25'
                      }`}
                    >
                      {t.status === 'resolved' ? 'Resolved ✓' : 'Mark Resolved'}
                    </button>

                    <button
                      onClick={() => setSelectedTicket(t)}
                      className="px-3 py-1.5 rounded-lg bg-[#D9C08A]/20 hover:bg-[#D9C08A]/30 text-[#D9C08A] font-bold text-xs border border-[#D9C08A]/40 transition-all flex items-center gap-1.5"
                    >
                      <ChatCircleDots size={14} weight="bold" />
                      <span>Inspect & Reply</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="p-1.5 rounded-lg text-[#9EABA2] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Ticket and Chat History"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                {/* Latest message snippet */}
                <div className="p-3 rounded-xl bg-[#070B09]/60 border border-white/5 text-xs text-[#9EABA2] flex items-center justify-between">
                  <div className="truncate max-w-xl">
                    <span className="font-bold text-[#F4F7F5] mr-1.5">Latest:</span>
                    <span>{t.messages[t.messages.length - 1]?.text || 'Ticket created'}</span>
                  </div>
                  <span className="text-[10px] text-[#9EABA2]/60 font-mono shrink-0 ml-2">
                    {t.messages.length} messages
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: TICKET CHAT INSPECTOR & LIVE AGENT REPLY
          ======================================================== */}
      {selectedTicket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="w-full max-w-2xl h-[620px] max-h-[90vh] flex flex-col rounded-2xl bg-[#0D1512] border border-[#D9C08A]/30 text-[#F4F7F5] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#070B09]/80">
              <div>
                <h3 className="text-base font-bold font-serif text-[#F4F7F5] flex items-center gap-2">
                  <span>Ticket Transcript: {selectedTicket.userName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#D9C08A]/20 text-[#D9C08A] font-mono">
                    {selectedTicket.priority}
                  </span>
                </h3>
                <p className="text-xs text-[#9EABA2] font-mono mt-0.5">
                  Email: {selectedTicket.userEmail} {selectedTicket.whatsapp ? `| WhatsApp: ${selectedTicket.whatsapp}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, selectedTicket.status === 'resolved' ? 'open' : 'resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedTicket.status === 'resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/50 hover:bg-[#34D399]/30'
                  }`}
                >
                  {selectedTicket.status === 'resolved' ? 'Resolved ✓' : 'Resolve & Close'}
                </button>
                <button
                  onClick={() => handleDeleteTicket(selectedTicket.id)}
                  className="p-1.5 rounded-lg text-[#9EABA2] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Chat History"
                >
                  <Trash size={16} />
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#070B09]/50 text-xs">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'agent'
                      ? 'items-end'
                      : m.sender === 'user'
                      ? 'items-start'
                      : 'items-center'
                  }`}
                >
                  <span className="text-[10px] text-[#9EABA2] font-mono mb-1">
                    {m.sender === 'agent' ? 'Admin / Live Agent' : m.sender === 'user' ? selectedTicket.userName : 'Smart Bot'}
                  </span>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-xl whitespace-pre-line leading-relaxed ${
                      m.sender === 'agent'
                        ? 'bg-[#D9C08A] text-[#070B09] font-medium'
                        : m.sender === 'user'
                        ? 'bg-[#131E1A] text-[#F4F7F5] border border-white/10'
                        : 'bg-white/5 text-[#9EABA2] border border-white/5 text-center text-[11px]'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-[#9EABA2]/60 mt-0.5 font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            {/* Admin Reply Input */}
            <form onSubmit={handleSendAdminReply} className="p-3.5 border-t border-white/10 bg-[#090F0C] flex gap-2">
              <input
                type="text"
                required
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder="Type your official administrative reply..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#131E1A] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]"
              />
              <button
                type="submit"
                disabled={isSendingReply || !adminReplyText.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#D9C08A] text-[#070B09] font-bold text-xs uppercase tracking-wider hover:bg-[#E5CE9F] disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <PaperPlaneRight size={14} weight="bold" />
                <span>{isSendingReply ? 'Sending...' : 'Reply'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: EDIT INTERNAL ADMIN NOTE
          ======================================================== */}
      {selectedFeedbackForNote && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D1512] border border-[#D9C08A]/30 text-[#F4F7F5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-[#F4F7F5] flex items-center gap-2">
                <NotePencil size={18} className="text-[#D9C08A]" />
                <span>Internal Admin Note</span>
              </h3>
              <button
                onClick={() => setSelectedFeedbackForNote(null)}
                className="text-[#9EABA2] hover:text-[#F4F7F5]"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-[#9EABA2]">
              Add administrative notes regarding feedback from{' '}
              <strong className="text-[#F4F7F5]">{selectedFeedbackForNote.userName}</strong>.
            </p>
            <textarea
              rows={4}
              value={editingNoteText}
              onChange={(e) => setEditingNoteText(e.target.value)}
              placeholder="e.g. Discussed in team meeting. Assigned to developer for next release."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070B09] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A] resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFeedbackForNote(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#9EABA2] hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAdminNote}
                className="px-4 py-2 rounded-xl bg-[#D9C08A] text-[#070B09] font-bold text-xs uppercase tracking-wider hover:bg-[#E5CE9F]"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
