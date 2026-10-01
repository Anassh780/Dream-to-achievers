import React, { useState } from 'react';
import { VideoSourceType } from '@/types';
import { getSourceMeta } from '@/lib/videoEmbed';
import { Play, Sparkle, FilmStrip } from '@phosphor-icons/react';

interface EmbedVideoPlayerProps {
  embedUrl: string;
  sourceType?: VideoSourceType;
  title: string;
  thumbnailUrl?: string;
  isDirectVideo?: boolean;
  className?: string;
  autoPlayOnClick?: boolean;
}

export const EmbedVideoPlayer: React.FC<EmbedVideoPlayerProps> = ({
  embedUrl,
  sourceType = 'generic_embed',
  title,
  thumbnailUrl,
  isDirectVideo = false,
  className = '',
  autoPlayOnClick = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(!thumbnailUrl && !autoPlayOnClick);
  const [isLoading, setIsLoading] = useState(true);
  const meta = getSourceMeta(sourceType);

  const finalSrc = isPlaying && embedUrl.includes('youtube') && !embedUrl.includes('autoplay=1')
    ? `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`
    : embedUrl;

  return (
    <div
      className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-[#070B09] border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(217,192,138,0.05)] group ${className}`}
    >
      {/* Source platform pill in top corner */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium backdrop-blur-md border ${meta.bg} ${meta.border} ${meta.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
          <span>{meta.label}</span>
        </span>
      </div>

      {/* Direct Video File (HTML5 Player) */}
      {isDirectVideo ? (
        <video
          src={embedUrl}
          poster={thumbnailUrl}
          controls
          preload="metadata"
          className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
        >
          <track kind="captions" />
          Your browser does not support the video tag.
        </video>
      ) : !isPlaying && thumbnailUrl ? (
        /* Facade Thumbnail View for Peak Core Web Vitals & Instant Load */
        <div
          onClick={() => setIsPlaying(true)}
          className="relative w-full h-full cursor-pointer overflow-hidden group/thumb"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsPlaying(true);
            }
          }}
          aria-label={`Play video: ${title}`}
        >
          <img
            src={thumbnailUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105 filter brightness-90 group-hover/thumb:brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Central Play Pulse Trigger */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D9C08A]/25 animate-ping" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#D9C08A] to-[#F3E7C4] text-[#070B09] flex items-center justify-center shadow-[0_0_30px_rgba(217,192,138,0.6)] group-hover/thumb:scale-110 transition-transform">
                <Play size={24} weight="fill" className="ml-1" />
              </div>
            </div>
          </div>

          {/* Bottom Title Bar on Thumbnail */}
          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 pointer-events-none">
            <p className="text-xs sm:text-sm font-serif font-semibold text-[#F4F7F5] line-clamp-1">
              {title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-[#D9C08A] flex items-center gap-1">
                <Sparkle size={10} weight="fill" />
                <span>Click to start watching</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Live Embedded Iframe */
        <>
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B09] z-10 space-y-2">
              <div className="w-6 h-6 border-2 border-[#D9C08A]/30 border-t-[#D9C08A] rounded-full animate-spin" />
              <span className="text-[11px] font-mono text-[#9EABA2]">Loading player stream...</span>
            </div>
          )}
          <iframe
            src={finalSrc}
            title={title}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0 rounded-2xl sm:rounded-3xl"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </>
      )}
    </div>
  );
};
