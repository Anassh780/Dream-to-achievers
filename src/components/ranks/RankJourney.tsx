import React from 'react';

export const RankJourney: React.FC = () => {
  const ranks = [
    {
      level: 'Level 01',
      name: 'Starter partner',
      slug: 'silver',
      sales: '10 units',
      team: '20 members',
      reward: 'PKR 2,000',
      description: 'Build your customer base and place your first team referrals.',
    },
    {
      level: 'Level 02',
      name: 'Growth partner',
      slug: 'platinum',
      sales: '25 units',
      team: '45 members',
      reward: 'PKR 4,000',
      description: 'Scale wholesale volume and grow an active distributor team.',
    },
    {
      level: 'Level 03',
      name: 'Regional partner',
      slug: 'gold',
      sales: '35 units',
      team: '60 members',
      reward: 'PKR 6,000',
      description: 'Manage multi-channel resale and mentor a regional team.',
    },
    {
      level: 'Level 04',
      name: 'National partner',
      slug: 'diamond',
      sales: '100 units',
      team: '200 members',
      reward: 'PKR 10,000',
      description: 'High-volume nationwide distribution with top-tier revenue share.',
    },
  ];

  return (
    <div className="w-full font-sans">
      <div className="levels-row shadow-xs">
        {ranks.map((r) => (
          <div
            key={r.slug}
            className="level-cell flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="font-mono text-xs text-[#5B5C50] mb-2.5">
                {r.level}
              </div>
              <h3 className="font-display text-[19px] font-medium text-[#1E241F] mb-2.5">
                {r.name}
              </h3>
              <p className="text-[13px] text-[#5B5C50] leading-relaxed min-h-[52px]">
                {r.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#E3DCC8]">
              <div className="flex justify-between text-xs text-[#5B5C50]">
                <span>Product sales</span>
                <strong className="font-mono font-medium text-[#1E241F]">{r.sales}</strong>
              </div>
              <div className="flex justify-between text-xs text-[#5B5C50]">
                <span>Team size</span>
                <strong className="font-mono font-medium text-[#1E241F]">{r.team}</strong>
              </div>
              <div className="flex justify-between items-center text-[13px] pt-1 text-[#1E241F]">
                <span>Cash bonus</span>
                <span className="font-mono font-semibold text-[#B8862E]">{r.reward}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
