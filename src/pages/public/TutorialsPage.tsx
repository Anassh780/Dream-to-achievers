import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { VideoTutorial } from '@/types';
import { tutorialService } from '@/services/tutorialService';
import { SEOHead } from '@/components/common/SEOHead';
import { EmbedVideoPlayer } from '@/components/video/EmbedVideoPlayer';
import { getSourceMeta } from '@/lib/videoEmbed';
import { Button } from '@/components/ui/Button';
import {
  VideoCamera,
  Sparkle,
  ArrowRight,
  Clock,
  PlayCircle,
  FolderSimple,
  BookOpen,
  ShoppingBag,
} from '@phosphor-icons/react';

export const TutorialsPage: React.FC = () => {
  const [tutorials, setTutorials] = useState<VideoTutorial[]>(() =>
    tutorialService.getActive()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVideoModal, setActiveVideoModal] = useState<VideoTutorial | null>(null);

  useEffect(() => {
    const refresh = () => setTutorials(tutorialService.getActive());
    window.addEventListener('dta_storage_change', refresh);
    return () => window.removeEventListener('dta_storage_change', refresh);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    tutorials.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return ['all', ...Array.from(cats)];
  }, [tutorials]);

  const filteredTutorials = useMemo(() => {
    if (selectedCategory === 'all') return tutorials;
    return tutorials.filter((t) => t.category === selectedCategory);
  }, [tutorials, selectedCategory]);

  const featuredTutorial = useMemo(() => {
    return tutorials.find((t) => t.featured) || tutorials[0];
  }, [tutorials]);

  const tutorialsSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Video Tutorials & Masterclasses — Dream to Achievers',
    description:
      'Step-by-step video tutorials and practical masterclasses on wholesale reselling, social commerce, and COD logistics in Pakistan.',
    url: 'https://dream-to-achievers.vercel.app/tutorials',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-24 font-sans selection:bg-[#D9C08A]/25">
      <SEOHead
        title="Video Tutorials & Masterclasses | Dream to Achievers"
        description="Watch step-by-step video tutorials on online reselling, wholesale product sourcing, WhatsApp marketing, and Cash on Delivery logistics in Pakistan."
        canonicalPath="/tutorials"
        ogType="website"
        structuredData={tutorialsSchema}
      />

      {/* 1. Header Banner & Nav Switcher */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 border-b border-white/10 bg-gradient-to-b from-[#0D1512] to-[#070B09] relative overflow-hidden text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D9C08A]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          {/* Sub-nav switcher between Video Tutorials & How Selling Works */}
          <div className="inline-flex p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-2">
            <span className="px-4 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#D9C08A] text-[#070B09] shadow-sm flex items-center gap-1.5">
              <VideoCamera size={14} weight="bold" />
              <span>Video Tutorials</span>
            </span>
            <Link
              to="/how-it-works"
              className="px-4 py-1.5 rounded-full text-xs font-mono font-medium text-[#9EABA2] hover:text-[#F4F7F5] transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag size={14} />
              <span>How Selling Works (4-Step)</span>
            </Link>
          </div>

          <h1 className="font-serif font-normal text-3xl sm:text-5xl text-[#F4F7F5] tracking-tight leading-[1.15]">
            Partner Video Tutorials & Masterclasses
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed max-w-xl mx-auto">
            Watch practical video guides to master wholesale product sourcing, viral social selling, automated COD courier dispatch, and ranking bonuses.
          </p>
        </div>
      </section>

      {/* 2. Main Content Body */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 space-y-12">
        {/* Featured Masterclass Hero (If Available) */}
        {featuredTutorial && (
          <div className="p-5 sm:p-8 rounded-3xl bg-[#0D1512]/90 backdrop-blur-xl border border-[#D9C08A]/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(217,192,138,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-7">
              <EmbedVideoPlayer
                embedUrl={featuredTutorial.embedUrl}
                sourceType={featuredTutorial.sourceType}
                title={featuredTutorial.title}
                thumbnailUrl={featuredTutorial.thumbnailUrl}
                sourceDirectUrl={featuredTutorial.sourceDirectUrl}
                description={featuredTutorial.description}
                isDirectVideo={featuredTutorial.sourceType === 'direct_video'}
              />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#D9C08A]/15 text-[#D9C08A] border border-[#D9C08A]/30">
                  Featured Masterclass
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-[#34D399] bg-[#34D399]/10 border border-[#34D399]/20">
                  {featuredTutorial.category}
                </span>
                {featuredTutorial.duration && (
                  <span className="text-[11px] font-mono text-[#9EABA2] flex items-center gap-1">
                    <Clock size={12} />
                    <span>{featuredTutorial.duration}</span>
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-[#F4F7F5] leading-snug">
                {featuredTutorial.title}
              </h2>

              {featuredTutorial.description && (
                <p className="text-xs sm:text-sm text-[#9EABA2] leading-relaxed">
                  {featuredTutorial.description}
                </p>
              )}

              <div className="pt-2 flex items-center gap-3">
                <Link to="/products">
                  <Button
                    variant="champagne"
                    size="sm"
                    className="font-medium text-xs shadow-md"
                    iconRight={<ArrowRight size={13} weight="bold" />}
                  >
                    Explore Wholesale Catalog
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-[#F4F7F5] hover:bg-white/[0.04] text-xs font-medium"
                  >
                    Join Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 2. Content: Either Videos Grid or Welcoming Placeholder */}
        {tutorials.length === 0 ? (
          <div className="p-10 sm:p-16 text-center rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6 max-w-2xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-[#D9C08A]/10 border border-[#D9C08A]/25 flex items-center justify-center text-[#D9C08A] mx-auto shadow-[0_0_30px_rgba(217,192,138,0.15)]">
              <VideoCamera size={32} weight="fill" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#F4F7F5]">
                Official Video Guides Coming Soon
              </h3>
              <p className="text-xs sm:text-sm text-[#9EABA2] max-w-md mx-auto leading-relaxed">
                Our team is currently preparing official, step-by-step masterclasses on product sourcing, order placement, and nationwide COD delivery.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link to="/how-it-works">
                <Button variant="champagne" size="sm" className="text-xs font-medium shadow-md">
                  View How Selling Works (4-Step Guide)
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="sm" className="border-white/20 text-[#F4F7F5] text-xs">
                  Browse Wholesale Catalog
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Category Filters */}
            <div className="flex items-center justify-between gap-4 flex-wrap border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/35 font-semibold shadow-xs'
                        : 'text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    {cat === 'all' ? `All Tutorials (${tutorials.length})` : cat}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono text-[#9EABA2] shrink-0">
                Showing {filteredTutorials.length} {filteredTutorials.length === 1 ? 'video' : 'videos'}
              </span>
            </div>

            {/* Video Tutorials Grid */}
            {filteredTutorials.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#0D1512]/60 border border-white/10 space-y-3">
                <PlayCircle size={36} className="text-[#9EABA2]/60 mx-auto" />
                <h3 className="font-serif text-lg text-[#F4F7F5]">No videos in this category</h3>
                <p className="text-xs text-[#9EABA2] max-w-sm mx-auto">
                  Please check back soon or switch categories to explore other available video guides.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredTutorials.map((tut) => {
                  const meta = getSourceMeta(tut.sourceType);
                  return (
                    <div
                      key={tut.id}
                      className="rounded-3xl bg-[#0D1512]/80 backdrop-blur-xl border border-white/10 hover:border-[#D9C08A]/40 transition-all duration-300 shadow-xl overflow-hidden flex flex-col group hover:shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(217,192,138,0.06)]"
                    >
                      {/* Embedded Player with all Video Player Modes */}
                      <div className="relative">
                        <EmbedVideoPlayer
                          embedUrl={tut.embedUrl}
                          sourceType={tut.sourceType}
                          title={tut.title}
                          thumbnailUrl={tut.thumbnailUrl}
                          sourceDirectUrl={tut.sourceDirectUrl}
                          description={tut.description}
                          isDirectVideo={tut.sourceType === 'direct_video'}
                        />
                      </div>

                      {/* Card Content & Details */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[#34D399] font-medium">
                              {tut.category}
                            </span>
                            {tut.duration && (
                              <span className="text-[10.5px] font-mono text-[#9EABA2] flex items-center gap-1">
                                <Clock size={11} />
                                <span>{tut.duration}</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-lg font-medium text-[#F4F7F5] group-hover:text-[#D9C08A] transition-colors line-clamp-2">
                            {tut.title}
                          </h3>

                          {tut.description && (
                            <p className="text-xs text-[#9EABA2] leading-relaxed line-clamp-3">
                              {tut.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                          <span className="text-[10px] font-mono text-[#9EABA2]/60">
                            {new Date(tut.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <div className="flex items-center gap-2.5">
                            {tut.sourceDirectUrl && (
                              <a
                                href={tut.sourceDirectUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-mono text-[#9EABA2] hover:text-[#34D399] transition-colors flex items-center gap-1"
                                title={`Open in ${meta.label}`}
                              >
                                <span>{meta.label}</span>
                                <ArrowRight size={10} />
                              </a>
                            )}
                            <span className="text-[10.5px] font-mono text-[#D9C08A] font-semibold flex items-center gap-1">
                              <span>Verified</span>
                              <Sparkle size={11} weight="fill" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* 3. Bottom Action Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0D1512] to-[#070B09] border border-[#D9C08A]/35 text-[#F4F7F5] text-center space-y-5 max-w-3xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(217,192,138,0.08)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#D9C08A]/10 rounded-full blur-2xl pointer-events-none" />
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#F4F7F5] relative z-10">
            Ready to apply what you learned?
          </h3>
          <p className="text-xs sm:text-sm text-[#9EABA2] max-w-md mx-auto leading-relaxed relative z-10">
            Create your free partner reseller account today, browse wholesale inventory, and start distributing with guaranteed margins.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
            <Link to="/signup">
              <Button
                variant="champagne"
                size="md"
                className="font-medium shadow-lg"
                iconRight={<ArrowRight size={13} />}
              >
                Create Free Partner Account
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button
                variant="outline"
                size="md"
                className="border-white/20 text-[#F4F7F5] hover:bg-[#D9C08A]/10 hover:border-[#D9C08A]/40 font-medium"
              >
                How Selling Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialsPage;
