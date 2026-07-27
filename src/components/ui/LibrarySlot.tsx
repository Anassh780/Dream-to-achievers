import React from 'react';
import { cn } from '@/lib/utils';

export interface LibrarySlotProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label describing the slot purpose when empty */
  slotName?: string;
  /** Pass third-party UI component directly as child or via render prop */
  fallbackMessage?: string;
}

/**
 * LibrarySlot Component
 * Designed as a plug-and-play extension boundary for third-party UI component libraries 
 * (shadcn/ui, Radix UI primitives, Tailwind UI, custom Canvas, or Chart libraries).
 */
export const LibrarySlot: React.FC<LibrarySlotProps> = ({
  slotName = 'Custom UI Slot',
  fallbackMessage,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'w-full relative transition-all duration-300',
        !children && 'border-2 border-dashed border-white/10 rounded-xl p-6 text-center bg-white/[0.02]',
        className
      )}
      {...props}
    >
      {children ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 py-4">
          <div className="w-8 h-8 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center font-mono text-xs font-bold">
            +
          </div>
          <span className="text-xs font-mono text-slate-400 font-medium">
            {slotName}
          </span>
          {fallbackMessage && (
            <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
              {fallbackMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
