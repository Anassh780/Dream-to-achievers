import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNotification } from '@/types';
import { Button } from '@/components/ui/Button';
import { notificationService } from '@/services/notificationService';
import {
  Trophy,
  Gift,
  ShoppingCart,
  Users,
  Bell,
  Clock,
  Check,
  CheckCircle,
  Copy,
  ArrowRight,
  X,
  ShieldCheck,
  Sparkle,
  ArrowSquareOut,
  CalendarBlank,
  Tag,
  CircleNotch,
  Trash,
} from '@phosphor-icons/react';

interface NotificationDetailModalProps {
  notification: AppNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleRead?: (id: string, currentlyRead: boolean) => void;
  onDelete?: (id: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
  onToggleRead,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !notification) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(notification.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (isNaN(diffSec) || diffSec < 0) return 'Just now';
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour}h ago`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 30) return `${diffDay}d ago`;
      const diffMonth = Math.floor(diffDay / 30);
      if (diffMonth < 12) return `${diffMonth}mo ago`;
      const diffYear = Math.floor(diffDay / 365);
      return `${diffYear}y ago`;
    } catch {
      return dateStr;
    }
  };

  const formatFullDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Determine icon, theme glow and category badge based on notification type
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'rank_achieved':
        return {
          icon: Trophy,
          label: 'Rank Achievement',
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          glowClass: 'from-amber-500/20 via-amber-500/5 to-transparent',
          iconBg: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
          ringColor: 'rgba(245, 158, 11, 0.3)',
        };
      case 'reward_paid':
      case 'reward_approved':
      case 'reward_earned':
        return {
          icon: Gift,
          label: 'Cash Bonus & Reward',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          glowClass: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
          iconBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
          ringColor: 'rgba(52, 211, 153, 0.3)',
        };
      case 'sale_submitted':
      case 'sale_confirmed':
      case 'sale_dispatched':
      case 'sale_delivered':
        return {
          icon: ShoppingCart,
          label: 'Store Order & Sales',
          badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          glowClass: 'from-sky-500/20 via-sky-500/5 to-transparent',
          iconBg: 'bg-sky-500/20 border-sky-500/30 text-sky-400',
          ringColor: 'rgba(56, 189, 248, 0.3)',
        };
      case 'referral_joined':
      case 'team_expansion':
        return {
          icon: Users,
          label: 'Network Downline',
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          glowClass: 'from-purple-500/20 via-purple-500/5 to-transparent',
          iconBg: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
          ringColor: 'rgba(168, 85, 247, 0.3)',
        };
      case 'withdrawal_requested':
      case 'withdrawal_approved':
      case 'withdrawal_paid':
      case 'withdrawal_rejected':
        return {
          icon: Sparkle,
          label: 'Payout Disbursement',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          glowClass: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
          iconBg: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
          ringColor: 'rgba(52, 211, 153, 0.3)',
        };
      case 'welcome':
        return {
          icon: Sparkle,
          label: 'Partner Clearance & Welcome',
          badgeClass: 'bg-champagne/15 text-[#D9C08A] border-[#D9C08A]/30',
          glowClass: 'from-[#D9C08A]/20 via-[#D9C08A]/5 to-transparent',
          iconBg: 'bg-[#D9C08A]/20 border-[#D9C08A]/30 text-[#D9C08A]',
          ringColor: 'rgba(217, 192, 138, 0.3)',
        };
      default:
        return {
          icon: Bell,
          label: 'Platform Notice',
          badgeClass: 'bg-champagne/15 text-[#D9C08A] border-[#D9C08A]/30',
          glowClass: 'from-[#D9C08A]/15 via-[#D9C08A]/5 to-transparent',
          iconBg: 'bg-[#D9C08A]/15 border-[#D9C08A]/30 text-[#D9C08A]',
          ringColor: 'rgba(217, 192, 138, 0.25)',
        };
    }
  };

  const config = getTypeConfig(notification.type);
  const IconComponent = config.icon;
  const targetLink = notification.linkUrl || notification.link;

  const getActionLabel = (link?: string) => {
    if (!link) return 'Open Section';
    if (link.includes('sales')) return 'Open Sales Ledger';
    if (link.includes('rewards')) return 'Open Milestone Rewards';
    if (link.includes('referrals')) return 'View Referral Network';
    if (link.includes('products')) return 'View Wholesale Catalog';
    if (link.includes('admin')) return 'Go to Executive Portal';
    return 'View Related Section';
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-notif-backdrop bg-black/75 overscroll-contain"
      onClick={onClose}
    >
      {/* Centered Glass Dialog Card */}
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[#0D1512]/95 backdrop-blur-2xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(217,192,138,0.06)] overflow-hidden flex flex-col max-h-[90vh] animate-notif-modal-spring"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Mesh */}
        <div
          className={`absolute top-0 inset-x-0 h-36 bg-gradient-to-b ${config.glowClass} pointer-events-none -z-0 opacity-80`}
        />

        {/* Modal Header */}
        <div className="relative z-10 px-6 pt-6 pb-4 border-b border-white/[0.08] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${config.iconBg}`}
              style={{ boxShadow: `0 0 20px ${config.ringColor}` }}
            >
              <IconComponent size={24} weight="fill" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}
                >
                  {config.label}
                </span>

                <span
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                    notification.isRead
                      ? 'bg-white/[0.04] text-[#9EABA2] border-white/10'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {notification.isRead ? 'Read' : 'New Notice'}
                </span>
              </div>

              <h2
                id="notification-modal-title"
                className="font-serif text-base sm:text-lg font-semibold text-[#F4F7F5] leading-snug break-words"
              >
                {notification.title}
              </h2>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onClose}
            aria-label="Close notification details"
            className="p-2 rounded-xl text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.06] active:scale-95 transition-all cursor-pointer border border-transparent hover:border-white/10 shrink-0"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 p-6 space-y-5 overflow-y-auto overscroll-contain flex-1">
          {/* Main Message Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#070B09]/80 border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9EABA2] block">
              Message Content
            </span>
            <p className="text-xs sm:text-sm text-[#F4F7F5] leading-relaxed font-sans whitespace-pre-line">
              {notification.message}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Timestamp Box */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-[#9EABA2]">
                <Clock size={13} className="text-[#34D399]" />
                <span>Timestamp</span>
              </div>
              <p className="text-[11.5px] font-mono text-[#F4F7F5]">
                {formatTimeAgo(notification.createdAt)}
              </p>
              <p className="text-[10px] text-[#9EABA2]/70 font-mono">
                {formatFullDate(notification.createdAt)}
              </p>
            </div>

            {/* Notification ID & Copy */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-[#9EABA2]">
                  <Tag size={13} className="text-[#D9C08A]" />
                  <span>Reference ID</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-[#D9C08A] hover:underline cursor-pointer"
                  title="Copy Notification ID"
                >
                  {copiedId ? (
                    <>
                      <Check size={11} className="text-[#34D399]" />
                      <span className="text-[#34D399]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] font-mono text-[#F4F7F5] truncate select-all">
                {notification.id}
              </p>
              <p className="text-[10px] text-[#9EABA2]/70 font-mono capitalize">
                Channel: {notification.type.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Delivery & Security Verification Stamp */}
          <div className="p-3 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} weight="fill" className="text-[#34D399]" />
              <span className="text-[11px] text-[#34D399] font-mono">Verified Ledger Dispatch</span>
            </div>
            <span className="text-[10px] font-mono text-[#9EABA2]">Encrypted Partner Node</span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="relative z-10 px-6 py-4 bg-[#070B09]/90 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleRead && (
              <button
                type="button"
                onClick={() => onToggleRead(notification.id, notification.isRead)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.05] border border-white/10 transition-colors cursor-pointer"
              >
                {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-mono text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                title="Delete this notification"
              >
                <Trash size={13} />
                <span>Delete</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {targetLink && (
              <Button
                type="button"
                variant="champagne"
                size="sm"
                onClick={() => {
                  if (!notification.isRead) {
                    notificationService.markAsRead(notification.id);
                  }
                  onClose();
                  navigate(targetLink);
                }}
                className="text-xs font-semibold shadow-lg"
                iconRight={<ArrowRight size={13} />}
              >
                {getActionLabel(targetLink)}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
