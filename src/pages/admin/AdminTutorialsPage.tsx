import React, { useState, useEffect, useMemo } from 'react';
import { VideoTutorial } from '@/types';
import { tutorialService } from '@/services/tutorialService';
import { parseVideoEmbed, getSourceMeta } from '@/lib/videoEmbed';
import { EmbedVideoPlayer } from '@/components/video/EmbedVideoPlayer';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  VideoCamera,
  Plus,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  CheckCircle,
  PlayCircle,
  Clock,
  Sparkle,
  Copy,
  Check,
  FilmStrip,
  ArrowSquareOut,
  FolderSimple,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react';

const PRESET_CATEGORIES = [
  'Getting Started',
  'Product Sourcing',
  'Social Selling',
  'COD & Logistics',
  'Bonuses & Ranks',
  'Advanced Tactics',
];

export const AdminTutorialsPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [tutorials, setTutorials] = useState<VideoTutorial[]>(() =>
    tutorialService.getAll()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoTutorial | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [category, setCategory] = useState('Getting Started');
  const [customCategory, setCustomCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<VideoTutorial | null>(null);

  // Preview Video Modal
  const [previewVideo, setPreviewVideo] = useState<VideoTutorial | null>(null);

  // Copy Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const refreshList = () => {
    setTutorials(tutorialService.getAll());
  };

  useEffect(() => {
    tutorialService.fetchFromCloud().then(() => {
      setTutorials(tutorialService.getAll());
    });
    window.addEventListener('dta_storage_change', refreshList);
    return () => window.removeEventListener('dta_storage_change', refreshList);
  }, []);

  // Live URL / Iframe Parsing for Preview
  const liveParsed = useMemo(() => {
    return parseVideoEmbed(rawInput);
  }, [rawInput]);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setRawInput('');
    setCategory('Getting Started');
    setCustomCategory('');
    setDuration('');
    setDescription('');
    setThumbnailUrl('');
    setSortOrder(tutorials.length + 1);
    setIsActive(true);
    setFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: VideoTutorial) => {
    setEditingItem(item);
    setTitle(item.title);
    setRawInput(item.rawInput || item.embedUrl);
    if (PRESET_CATEGORIES.includes(item.category)) {
      setCategory(item.category);
      setCustomCategory('');
    } else {
      setCategory('Custom');
      setCustomCategory(item.category);
    }
    setDuration(item.duration || '');
    setDescription(item.description || '');
    setThumbnailUrl(item.thumbnailUrl || '');
    setSortOrder(item.sortOrder);
    setIsActive(item.isActive);
    setFeatured(Boolean(item.featured));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toastError('Please enter a video tutorial title.');
      return;
    }
    if (!rawInput.trim()) {
      toastError('Please enter a video link or iframe embed code.');
      return;
    }

    const finalCategory = category === 'Custom' ? customCategory.trim() || 'General' : category;

    try {
      await tutorialService.save(
        {
          id: editingItem ? editingItem.id : undefined,
          title: title.trim(),
          rawInput: rawInput.trim(),
          category: finalCategory,
          duration: duration.trim(),
          description: description.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          sortOrder: Number(sortOrder) || 1,
          isActive,
          featured,
        },
        currentAdmin
      );

      toastSuccess(
        editingItem ? 'Video tutorial updated successfully.' : 'New video tutorial added.'
      );
      setIsModalOpen(false);
      refreshList();
    } catch (err: any) {
      toastError(err.message || 'Failed to save video tutorial.');
    }
  };

  const handleToggleStatus = async (item: VideoTutorial) => {
    try {
      const updated = await tutorialService.toggleStatus(item.id, currentAdmin);
      if (updated) {
        toastInfo(`Tutorial "${item.title}" is now ${updated.isActive ? 'active' : 'hidden'}.`);
        refreshList();
      }
    } catch {
      toastError('Failed to toggle status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await tutorialService.delete(deleteTarget.id, currentAdmin);
      toastSuccess(`Deleted video tutorial "${deleteTarget.title}".`);
      setDeleteTarget(null);
      refreshList();
    } catch {
      toastError('Failed to delete video tutorial.');
    }
  };

  const handleCopyLink = (item: VideoTutorial) => {
    navigator.clipboard.writeText(item.rawInput || item.embedUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    toastInfo('Video link copied to clipboard.');
  };

  // Filtered List
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedFilterCategory === 'all' || item.category === selectedFilterCategory;

      return matchesSearch && matchesCat;
    });
  }, [tutorials, searchQuery, selectedFilterCategory]);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    tutorials.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tutorials]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D9C08A] animate-pulse shadow-[0_0_8px_rgba(217,192,138,0.8)]" />
            <span className="text-[11px] font-mono text-[#D9C08A] font-semibold uppercase tracking-wider">
              Academy & Media CMS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F4F7F5] tracking-tight mt-1">
            Video Tutorials Management
          </h1>
          <p className="text-xs sm:text-sm text-[#9EABA2] mt-1">
            Add embedded video links (YouTube, Vimeo, Loom, Drive, direct MP4, or iframe codes) displayed in the public Tutorials hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="champagne"
            size="sm"
            onClick={openCreateModal}
            className="font-medium text-xs shadow-md"
            iconLeft={<Plus size={15} weight="bold" />}
          >
            Add New Video Tutorial
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D1512]/90 border border-white/10 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-[#9EABA2] uppercase tracking-wider">
            Total Videos
          </span>
          <div className="text-2xl font-serif font-bold text-[#F4F7F5]">{tutorials.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0D1512]/90 border border-[#34D399]/25 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-[#34D399] uppercase tracking-wider">
            Active / Published
          </span>
          <div className="text-2xl font-serif font-bold text-[#34D399]">
            {tutorials.filter((t) => t.isActive).length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0D1512]/90 border border-white/10 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-[#9EABA2] uppercase tracking-wider">
            Draft / Hidden
          </span>
          <div className="text-2xl font-serif font-bold text-amber-400">
            {tutorials.filter((t) => !t.isActive).length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-[#0D1512]/90 border border-white/10 shadow-sm space-y-1">
          <span className="text-[10px] font-mono text-[#D9C08A] uppercase tracking-wider">
            Categories
          </span>
          <div className="text-2xl font-serif font-bold text-[#D9C08A]">{allCategories.length}</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EABA2]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials by title, category, description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setSelectedFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-colors cursor-pointer ${
              selectedFilterCategory === 'all'
                ? 'bg-[#D9C08A]/15 text-[#D9C08A] border border-[#D9C08A]/35 font-semibold'
                : 'text-[#9EABA2] hover:text-[#F4F7F5] bg-white/[0.03]'
            }`}
          >
            All Categories
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono shrink-0 transition-colors cursor-pointer ${
                selectedFilterCategory === cat
                  ? 'bg-[#D9C08A]/15 text-[#D9C08A] border border-[#D9C08A]/35 font-semibold'
                  : 'text-[#9EABA2] hover:text-[#F4F7F5] bg-white/[0.03]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tutorials List Table / Cards */}
      {filteredTutorials.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0D1512]/60 border border-white/10 space-y-3">
          <VideoCamera size={40} className="text-[#9EABA2]/60 mx-auto" />
          <h3 className="font-serif text-lg text-[#F4F7F5]">No video tutorials found</h3>
          <p className="text-xs text-[#9EABA2] max-w-sm mx-auto">
            {searchQuery
              ? 'No tutorials match your search query.'
              : 'Add your first video tutorial using the button above.'}
          </p>
          <Button variant="champagne" size="sm" onClick={openCreateModal} className="mt-2 text-xs">
            Add Video Tutorial
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map((item) => {
            const meta = getSourceMeta(item.sourceType);
            return (
              <div
                key={item.id}
                className={`rounded-3xl bg-[#0D1512]/90 border transition-all duration-300 overflow-hidden flex flex-col shadow-xl ${
                  item.isActive
                    ? 'border-white/10 hover:border-[#D9C08A]/40'
                    : 'border-white/[0.06] opacity-70 bg-white/[0.01]'
                }`}
              >
                {/* Video Preview Aspect Frame */}
                <div className="relative group/player">
                  <EmbedVideoPlayer
                    embedUrl={item.embedUrl}
                    sourceType={item.sourceType}
                    title={item.title}
                    thumbnailUrl={item.thumbnailUrl}
                    sourceDirectUrl={item.sourceDirectUrl}
                    description={item.description}
                    isDirectVideo={item.sourceType === 'direct_video'}
                  />
                  {item.featured && (
                    <span className="absolute top-3 right-3 z-30 px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold bg-[#D9C08A] text-[#070B09] shadow-md uppercase tracking-wider">
                      Featured Top
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[#34D399]">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.duration && (
                          <span className="text-[10.5px] font-mono text-[#9EABA2] flex items-center gap-1">
                            <Clock size={11} />
                            <span>{item.duration}</span>
                          </span>
                        )}
                        <span
                          className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                            item.isActive
                              ? 'bg-emerald-500/15 text-[#34D399]'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          {item.isActive ? 'ACTIVE' : 'HIDDEN'}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-serif text-base font-semibold text-[#F4F7F5] line-clamp-2">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="text-xs text-[#9EABA2] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item)}
                        title="Copy video link"
                        className="p-1.5 rounded-lg text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <Check size={14} className="text-[#34D399]" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        title={item.isActive ? 'Hide from public hub' : 'Make visible to users'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          item.isActive
                            ? 'text-[#34D399] hover:bg-[#34D399]/10'
                            : 'text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        {item.isActive ? <Eye size={15} /> : <EyeSlash size={15} />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="px-2.5 py-1 rounded-lg text-xs font-mono text-[#D9C08A] hover:bg-[#D9C08A]/10 border border-[#D9C08A]/25 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <PencilSimple size={13} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete tutorial"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#0D1512] border border-[#D9C08A]/35 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(217,192,138,0.1)] overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#070B09]/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D9C08A]/10 border border-[#D9C08A]/25 flex items-center justify-center text-[#D9C08A]">
                  <VideoCamera size={18} weight="fill" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F4F7F5]">
                    {editingItem ? 'Edit Video Tutorial' : 'Add New Video Tutorial'}
                  </h3>
                  <span className="text-[10px] font-mono text-[#9EABA2]">
                    Supports YouTube, Vimeo, Loom, Drive, direct video, or any iframe embed
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9EABA2] hover:text-[#F4F7F5] hover:bg-white/[0.06] cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-[#D9C08A] uppercase tracking-wider mb-1.5">
                  Tutorial Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How to Source Wholesale Products & Share on WhatsApp"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]/60"
                />
              </div>

              {/* Video URL or Iframe Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-[#D9C08A] uppercase tracking-wider">
                    Video Link or Iframe Code *
                  </label>
                  {rawInput && liveParsed.isValid && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        getSourceMeta(liveParsed.sourceType).bg
                      } ${getSourceMeta(liveParsed.sourceType).text} ${
                        getSourceMeta(liveParsed.sourceType).border
                      }`}
                    >
                      Detected: {getSourceMeta(liveParsed.sourceType).label}
                    </span>
                  )}
                </div>
                <textarea
                  required
                  rows={2}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Paste YouTube URL, Vimeo, Loom, Google Drive preview, .mp4 link, or <iframe src=...> code"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]/60"
                />
                <p className="text-[10.5px] font-mono text-[#9EABA2]/80 mt-1">
                  Works with any embedded source: YouTube (watch, share, shorts), Google Drive (drive.google.com/file/d/..., open?id=..., uc?id=...), Vimeo, Loom, Dailymotion, direct MP4, or &lt;iframe&gt;. Google Drive thumbnails are automatically extracted.
                </p>
              </div>

              {/* Live Preview Card */}
              {rawInput.trim() && liveParsed.isValid && (
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#34D399]">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle size={14} weight="bold" />
                      <span>Live Embed Stream Preview ({liveParsed.sourceType})</span>
                    </span>
                    {liveParsed.sourceDirectUrl && (
                      <a
                        href={liveParsed.sourceDirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-[#D9C08A] hover:underline flex items-center gap-1"
                      >
                        <span>Test Direct Link</span>
                        <ArrowSquareOut size={11} />
                      </a>
                    )}
                  </div>
                  <div className="max-w-md mx-auto">
                    <EmbedVideoPlayer
                      embedUrl={liveParsed.embedUrl}
                      sourceType={liveParsed.sourceType}
                      title={title || 'Tutorial Preview'}
                      thumbnailUrl={thumbnailUrl || liveParsed.thumbnailUrl}
                      sourceDirectUrl={liveParsed.sourceDirectUrl}
                      description={description}
                      isDirectVideo={liveParsed.isDirectVideo}
                      autoPlayOnClick={false}
                    />
                  </div>
                </div>
              )}

              {/* Category & Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#D9C08A] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D1512] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]/60"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Custom">+ Custom Category</option>
                  </select>

                  {category === 'Custom' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Type custom category name..."
                      className="w-full mt-2 px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]/60"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#D9C08A] uppercase tracking-wider mb-1.5">
                    Duration (Optional)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 5:30 or 10 min"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]/60"
                  />
                </div>
              </div>

              {/* Custom Thumbnail URL & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-[#D9C08A] uppercase tracking-wider mb-1.5">
                    Custom Thumbnail URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="Leave empty for auto-extracted thumbnail"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#D9C08A] uppercase tracking-wider mb-1.5">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F4F7F5] focus:outline-none focus:border-[#D9C08A]/60"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono text-[#D9C08A] uppercase tracking-wider mb-1.5">
                  Description / Key Takeaways
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary of what partners will learn in this video guide..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#F4F7F5] placeholder-[#9EABA2]/60 focus:outline-none focus:border-[#D9C08A]/60"
                />
              </div>

              {/* Toggles */}
              <div className="pt-2 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#34D399] focus:ring-0 bg-white/10 border-white/20"
                  />
                  <span className="text-xs text-[#F4F7F5] font-medium">
                    Publish immediately (Visible to users)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D9C08A] focus:ring-0 bg-white/10 border-white/20"
                  />
                  <span className="text-xs text-[#F4F7F5] font-medium">
                    Pin as Featured Top Masterclass
                  </span>
                </label>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="border-white/20 text-[#F4F7F5] text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="champagne"
                  size="sm"
                  className="text-xs font-semibold shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Publish Tutorial'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Video Tutorial"
        description={`Are you sure you want to permanently delete the video tutorial "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Tutorial"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminTutorialsPage;
