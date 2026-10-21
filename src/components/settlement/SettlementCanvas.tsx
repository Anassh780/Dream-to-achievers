import React, { forwardRef } from 'react';
import { SettlementRecord } from '@/types/settlement';
import { ExecutiveStatementTemplate } from './templates/ExecutiveStatementTemplate';
import { PlatinumMilestoneTemplate } from './templates/PlatinumMilestoneTemplate';
import { DigitalModernTemplate } from './templates/DigitalModernTemplate';

interface SettlementCanvasProps {
  record: SettlementRecord;
  scale?: number;
}

export const SettlementCanvas = forwardRef<HTMLDivElement, SettlementCanvasProps>(
  ({ record, scale = 1 }, ref) => {
    return (
      <div
        className="relative flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          width: 1200 * scale,
          height: 750 * scale,
        }}
      >
        <div
          ref={ref}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: 1200,
            height: 750,
          }}
          className="shrink-0"
        >
          {record.template === 'executive_statement' && (
            <ExecutiveStatementTemplate record={record} />
          )}
          {record.template === 'platinum_milestone' && (
            <PlatinumMilestoneTemplate record={record} />
          )}
          {record.template === 'digital_modern' && (
            <DigitalModernTemplate record={record} />
          )}
        </div>
      </div>
    );
  }
);

SettlementCanvas.displayName = 'SettlementCanvas';
