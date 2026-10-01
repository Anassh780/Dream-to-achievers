import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoSourceType } from '@/types';
import { getSourceMeta } from '@/lib/videoEmbed';
import {
  Play,
  Sparkle,
  ArrowsOut,
  ArrowsIn,
  Television,
  ArrowSquareOut,
  X,
  PictureInPicture,
  FilmStrip,
  VideoCamera,
} from '@phosphor-icons/react';

export interface EmbedVideoPlayerProps {
  embedUrl: string;
  sourceType?: VideoSourceType;
  title: string;
  thumbnailUrl?: string;
  sourceDirectUrl?: string;
  description?: string;
  isDirectVideo?: boolean;
  className?: string;
  autoPlayOnClick?: boolean;
  onOpenCinema?: () => void;
  aspectRatioClass?: string;
}

export const EmbedVideoPlayer: React.FC<EmbedVideoPlayerProps> = ({
  embedUrl,
  sourceType = 'generic_embed',
  title,
  thumbnailUrl,
  sourceDirectUrl,
  description,
  isDirectVideo = false,
  className = '',
  autoPlayOnClick = true,
  onOpenCinema,
  aspectRatioClass = 'aspect-video',
}) => {
  const [isPlaying, setIsPlaying] = useState(!thumbnailUrl && !autoPlayOnClick);
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const meta = getSourceMeta(sourceType);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement || (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Keyboard shortcut for Cinema mode (Escape to close)
  useEffect(() => {
    if (!isCinemaOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCinemaOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinemaOpen]);

  const toggleFullscreen = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const elem = containerRef.current as any;
      if (!elem) return;

      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('[VideoPlayer] Fullscreen request error:', err);
    }
  };

  const handleOpenCinema = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onOpenCinema) {
      onOpenCinema();
    } else {
      setIsCinemaOpen(true);
    }
  };

  const handleTogglePiP = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.warn('[VideoPlayer] PiP toggle error:', err);
      }
    }
  };

  const finalSrc =
    isPlaying && embedUrl.includes('youtube') && !embedUrl.includes('autoplay=1')
      ? `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`
      : embedUrl;

  const resolvedDirectUrl = sourceDirectUrl || embedUrl;
  const showCustomPoster = !isPlaying && (!thumbnailUrl || imgError);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative w-full ${aspectRatioClass} rounded-2xl sm:rounded-3xl overflow-hidden bg-[#070B09] border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(217,192,138,0.05)] group select-none ${className}`}
      >
        {/* Top Control Bar: Source Pill (Left) & Watch Modes (Right) */}
        <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 z-30 flex items-center justify-between pointer-events-none">
          {/* Source Platform Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[9.5px] sm:text-[10px] font-mono font-medium backdrop-blur-md border shadow-md pointer-events-auto ${meta.bg} ${meta.border} ${meta.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
            <span>{meta.label}</span>
          </span>

          {/* Quick Player Mode Actions */}
          <div className="flex items-center gap-1.5 pointer-events-auto opacity-90 group-hover:opacity-100 transition-opacity">
            {/* Cinema / Theatre Mode Trigger */}
            <button
              type="button"
              onClick={handleOpenCinema}
              title="Theatre / Cinema Mode"
              className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-[#D9C08A] hover:text-[#070B09] text-[#F4F7F5] backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer flex items-center gap-1"
            >
              <Television size={13} weight="bold" />
              <span className="hidden sm:inline text-[9.5px] font-mono font-semibold">Cinema</span>
            </button>

            {/* Native Fullscreen Mode Trigger */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-white/20 text-[#F4F7F5] backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer"
            >
              {isFullscreen ? <ArrowsIn size={13} weight="bold" /> : <ArrowsOut size={13} weight="bold" />}
            </button>

            {/* Picture in Picture for direct HTML5 video */}
            {isDirectVideo && (
              <button
                type="button"
                onClick={handleTogglePiP}
                title="Picture-in-Picture"
                className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-white/20 text-[#F4F7F5] backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer"
              >
                <PictureInPicture size={13} weight="bold" />
              </button>
            )}

            {/* Direct Source Link Pop-out */}
            {resolvedDirectUrl && (
              <a
                href={resolvedDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open original stream on ${meta.label}`}
                className="p-1.5 sm:p-2 rounded-xl bg-black/60 hover:bg-[#34D399] hover:text-[#070B09] text-[#F4F7F5] backdrop-blur-md border border-white/15 transition-all shadow-md cursor-pointer"
              >
                <ArrowSquareOut size={13} weight="bold" />
              </a>
            )}
          </div>
        </div>

        {/* Video Surface Rendering */}
        {isDirectVideo ? (
          /* Direct HTML5 Video */
          <video
            ref={videoRef}
            src={embedUrl}
            poster={thumbnailUrl}
            controls
            preload="metadata"
            playsInline
            className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
          >
            <track kind="captions" />
            Your browser does not support the video tag.
          </video>
        ) : !isPlaying && thumbnailUrl && !imgError ? (
          /* High-Res Thumbnail Facade */
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
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105 filter brightness-[0.88] group-hover/thumb:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/25" />

            {/* Central Play Pulse Trigger */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D9C08A]/25 animate-ping" />
                <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#D9C08A] to-[#F3E7C4] text-[#070B09] flex items-center justify-center shadow-[0_0_35px_rgba(217,192,138,0.65)] group-hover/thumb:scale-110 transition-transform">
                  <Play size={24} weight="fill" className="ml-1 text-[#070B09]" />
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
                  <span>Click to watch inline • Cinema & Fullscreen available</span>
                </span>
              </div>
            </div>
          </div>
        ) : showCustomPoster ? (
          /* Branded Luxury Poster (When thumbnail is missing, restricted, or Google Drive CORS blocked) */
          <div
            onClick={() => setIsPlaying(true)}
            className="relative w-full h-full cursor-pointer overflow-hidden p-6 flex flex-col justify-between bg-gradient-to-br from-[#0D1512] via-[#070B09] to-[#121E18] border border-white/5 group/poster"
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
            {/* Ambient Background Grid & Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(217,192,138,0.12),transparent_65%)] pointer-events-none" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#34D399]/10 rounded-full blur-3xl pointer-events-none" />

            <div />

            {/* Center Play Button & Platform Cue */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative flex items-center justify-center">
                <span className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D9C08A]/20 animate-ping" />
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#D9C08A] to-[#F3E7C4] text-[#070B09] flex items-center justify-center shadow-[0_0_35px_rgba(217,192,138,0.6)] group-hover/poster:scale-110 transition-transform">
                  <Play size={24} weight="fill" className="ml-1 text-[#070B09]" />
                </div>
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="text-xs sm:text-sm font-serif font-bold text-[#F4F7F5] line-clamp-1">
                  {title}
                </h4>
                <p className="text-[10px] font-mono text-[#D9C08A] flex items-center justify-center gap-1">
                  <Sparkle size={10} weight="fill" />
                  <span>Click to stream {meta.label} video</span>
                </p>
              </div>
            </div>

            {/* Bottom Modes Indicator Bar */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono text-[#9EABA2]">
              <span className="flex items-center gap-1">
                <FilmStrip size={11} className="text-[#D9C08A]" />
                <span>Edge-to-Edge Stream</span>
              </span>
              <span className="text-[#34D399] font-medium">Full Player Ready</span>
            </div>
          </div>
        ) : (
          /* Live Embedded Iframe with full Display Sizing */
          <div className="relative w-full h-full bg-[#070B09]">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070B09] z-10 space-y-2">
                <div className="w-7 h-7 border-2 border-[#D9C08A]/30 border-t-[#D9C08A] rounded-full animate-spin" />
                <span className="text-[11px] font-mono text-[#9EABA2]">
                  Loading {meta.label} stream...
                </span>
              </div>
            )}
            <iframe
              src={finalSrc}
              title={title}
              onLoad={() => setIsLoading(false)}
              className="absolute inset-0 w-full h-full border-0 rounded-2xl sm:rounded-3xl"
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
      </div>

      {/* Built-in Cinema / Theatre Mode Portal Overlay */}
      {isCinemaOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 lg:p-8 animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label={`Cinema Mode: ${title}`}
          >
            {/* Cinema Header */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium backdrop-blur-md border ${meta.bg} ${meta.border} ${meta.text} shrink-0`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} animate-pulse`} />
                  <span>{meta.label}</span>
                </span>
                <h3 className="font-serif text-sm sm:text-base lg:text-lg font-bold text-[#F4F7F5] truncate">
                  {title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {resolvedDirectUrl && (
                  <a
                    href={resolvedDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#34D399] hover:text-[#070B09] text-xs font-mono text-[#F4F7F5] transition-colors border border-white/10 flex items-center gap-1.5"
                  >
                    <ArrowSquareOut size={14} />
                    <span className="hidden sm:inline">Open in {meta.label}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsCinemaOpen(false)}
                  className="p-2 rounded-xl bg-white/[0.08] hover:bg-white/20 text-[#F4F7F5] border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                  title="Close Cinema Mode (Esc)"
                >
                  <X size={18} weight="bold" />
                  <span className="text-[10px] font-mono uppercase text-[#9EABA2] hidden sm:inline">
                    Esc
                  </span>
                </button>
              </div>
            </div>

            {/* Cinema Central Widescreen Video Surface */}
            <div className="flex-1 flex items-center justify-center p-2 sm:p-4 my-auto">
              <div className="w-full max-w-6xl aspect-video max-h-[82vh] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(217,192,138,0.12)] border border-white/15 bg-black relative">
                {isDirectVideo ? (
                  <video
                    src={embedUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    <track kind="captions" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    src={
                      embedUrl.includes('youtube') && !embedUrl.includes('autoplay=1')
                        ? `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`
                        : embedUrl
                    }
                    title={title}
                    className="w-full h-full border-0"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            {/* Cinema Footer Bar */}
            <div className="max-w-7xl mx-auto w-full pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-[#9EABA2]">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="text-[#D9C08A] flex items-center gap-1">
                  <Television size={13} weight="fill" />
                  <span>Theatre Cinema Mode</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="text-[11px] truncate max-w-md">
                  {description || 'Unobstructed full resolution playback'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span>Tip: Press ESC or click Close to return</span>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
