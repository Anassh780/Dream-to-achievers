import React, { useEffect } from 'react';
import { Button } from './Button';
import { Warning, X, Trash, Check } from '@phosphor-icons/react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
    >
      <div
        className="w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-white rounded-2xl border border-[#E3DCC8] shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDanger
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {isDanger ? (
                <Warning size={22} weight="bold" />
              ) : (
                <Check size={22} weight="bold" />
              )}
            </div>
            <div>
              <h3
                id="confirm-dialog-title"
                className="font-serif font-bold text-base text-[#1E241F]"
              >
                {title}
              </h3>
              <p className="text-xs text-[#5B5C50] leading-relaxed mt-1">
                {description}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg text-[#7C7D70] hover:text-[#1E241F] hover:bg-[#FAF7EF] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E3DCC8]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="text-xs font-medium"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={isDanger ? 'danger' : 'primary'}
            size="sm"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
            }}
            className="text-xs font-medium"
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
