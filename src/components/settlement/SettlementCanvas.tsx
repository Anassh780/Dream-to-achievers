import React, { forwardRef } from 'react';
import { SettlementRecord } from '@/types/settlement';
import { FundingPipsPortraitTemplate } from './templates/FundingPipsPortraitTemplate';
import { FundingPipsVIPTemplate } from './templates/FundingPipsVIPTemplate';
import { ExecutiveStatementTemplate } from './templates/ExecutiveStatementTemplate';
import { PlatinumMilestoneTemplate } from './templates/PlatinumMilestoneTemplate';
import { DigitalModernTemplate } from './templates/DigitalModernTemplate';

interface SettlementCanvasProps {
  record: SettlementRecord;
  scale?: number;
}

export const SettlementCanvas = forwardRef<HTMLDivElement, SettlementCanvasProps>(
  ({ record, scale = 1 }, ref) => {
    const isPortrait =
      !record.template ||
      record.template === 'funding_pips_portrait' ||
      record.template === 'emerald_website_ui';

    const baseWidth = isPortrait ? 600 : 1200;
    const baseHeight = isPortrait ? 840 : 750;

    return (
      <div
        className="relative mx-auto transition-all duration-200 select-none shadow-2xl rounded-3xl overflow-hidden shrink-0"
        style={{
          width: Math.round(baseWidth * scale),
          height: Math.round(baseHeight * scale),
        }}
      >
        <div
          style={{
            width: baseWidth,
            height: baseHeight,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <div
            ref={ref}
            className="shrink-0"
            style={{
              width: baseWidth,
              height: baseHeight,
            }}
          >
            {(!record.template || record.template === 'funding_pips_portrait') && (
              <FundingPipsPortraitTemplate record={record} variant="blue" />
            )}
            {record.template === 'emerald_website_ui' && (
              <FundingPipsPortraitTemplate record={record} variant="emerald" />
            )}
            {record.template === 'funding_pips_vip' && (
              <FundingPipsVIPTemplate record={record} />
            )}
            {record.template === 'platinum_milestone' && (
              <PlatinumMilestoneTemplate record={record} />
            )}
            {record.template === 'digital_modern' && (
              <DigitalModernTemplate record={record} />
            )}
            {record.template === 'executive_statement' && (
              <ExecutiveStatementTemplate record={record} />
            )}
          </div>
        </div>
      </div>
    );
  }
);

SettlementCanvas.displayName = 'SettlementCanvas';
