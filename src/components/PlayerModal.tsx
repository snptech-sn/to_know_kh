import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  X,
  ExternalLink,
  Star,
  Copy,
  Check,
  Edit3,
  Calendar,
  Images,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Bookmark,
  Info,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowUp,
} from 'lucide-react';
import { VideoItem } from '../types/video';
import {
  formatCompactNumber,
  toKhmerNumerals,
  cleanFacebookUrl,
} from '../utils/videoHelper';
import { OFFICIAL_PAGE_INFO } from '../data/initialVideos';
import { PhotoGalleryPlayer } from './PhotoGalleryPlayer';

interface PlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onEdit: (video: VideoItem) => void;
  onToggleFavorite: (id: string) => void;
  lang: 'km' | 'en';
}

interface PlayerModalContentProps {
  video: VideoItem;
  onClose: () => void;
  onEdit: (video: VideoItem) => void;
  onToggleFavorite: (id: string) => void;
  lang: 'km' | 'en';
}

const PlayerModalContent: React.FC<PlayerModalContentProps> = ({
  video,
  onClose,
  onEdit,
  onToggleFavorite,
  lang,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [activeMediaView, setActiveMediaView] = useState<'thumbnail' | 'gallery'>('thumbnail');
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isAutoSlide, setIsAutoSlide] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isReadingScrolled, setIsReadingScrolled] = useState(false);
  const [showPiP, setShowPiP] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  const thumbnailSrc =
    video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000';

  // Compute all slide thumbnails: starts with video.thumbnail, plus video.images without duplicates
  const allSlideImages = useMemo(() => {
    const list: string[] = [];
    if (video.thumbnail) {
      list.push(video.thumbnail);
    }
    if (video.images && video.images.length > 0) {
      video.images.forEach((img) => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    return list.length > 0 ? list : [thumbnailSrc];
  }, [video.thumbnail, video.images, thumbnailSrc]);

  const hasImages = allSlideImages.length > 1;

  // Reset slide index when video ID changes
  useEffect(() => {
    setSlideIndex(0);
    setSlideProgress(0);
  }, [video.id]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const goToNextSlide = useCallback(() => {
    if (allSlideImages.length <= 1) return;
    setSlideIndex((prev) => (prev + 1) % allSlideImages.length);
    setSlideProgress(0);
  }, [allSlideImages.length]);

  const goToPrevSlide = useCallback(() => {
    if (allSlideImages.length <= 1) return;
    setSlideIndex((prev) => (prev === 0 ? allSlideImages.length - 1 : prev - 1));
    setSlideProgress(0);
  }, [allSlideImages.length]);

  // Auto-Slide Timer: automatically transitions slides every 4s when reading, pauses on hover
  useEffect(() => {
    if (!hasImages || !isAutoSlide || isHovered || activeMediaView !== 'thumbnail') {
      setSlideProgress(0);
      return;
    }

    const intervalTime = 4000;
    const stepTime = 50;
    const progressStep = (stepTime / intervalTime) * 100;

    const timer = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) {
          goToNextSlide();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasImages, isAutoSlide, isHovered, activeMediaView, goToNextSlide]);

  // Track scroll position in modal: when reading text/article below, show floating slide preview
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      // If scrolled past 220px, user is reading the text/article details below
      setIsReadingScrolled(el.scrollTop > 220);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeMediaView !== 'thumbnail') return;
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMediaView, goToNextSlide, goToPrevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      goToNextSlide();
    } else if (diff < -45) {
      goToPrevSlide();
    }
    touchStartX.current = null;
  };

  const currentSlideImage = allSlideImages[slideIndex] || allSlideImages[0] || thumbnailSrc;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(video.url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImageLink = () => {
    navigator.clipboard.writeText(currentSlideImage);
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 2000);
  };

  const statusConfig = {
    published: {
      km: 'បានបង្ហោះផ្លូវការ',
      en: 'Published',
      color: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
      dot: 'bg-emerald-400',
    },
    scheduled: {
      km: 'គ្រោងបង្ហោះ',
      en: 'Scheduled',
      color: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
      dot: 'bg-amber-400',
    },
    draft: {
      km: 'ព្រាងទុក',
      en: 'Draft',
      color: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
      dot: 'bg-slate-400',
    },
  }[video.status || 'published'];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-white/15 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-white">
        
        {/* Header Bar - Fully Responsive, Close Button ALWAYS Pinned & Prominent */}
        <div className="border-b border-white/10 bg-white/5 backdrop-blur-md shrink-0">
          {/* Main Top Row */}
          <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
            {/* Left: Platform & Category Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold bg-indigo-600 text-white uppercase tracking-wider shadow-sm border border-indigo-400/30 shrink-0">
                {video.platform}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-indigo-300 bg-indigo-500/15 border border-indigo-400/20 px-2 sm:px-2.5 py-1 rounded-lg truncate max-w-[120px] sm:max-w-[200px]">
                {video.category}
              </span>
              <span className={`hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg border items-center gap-1.5 ${statusConfig.color} shrink-0`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                <span>{lang === 'km' ? statusConfig.km : statusConfig.en}</span>
              </span>
              {hasImages && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2.5 py-1 rounded-lg shrink-0">
                  <Images className="w-3 h-3 text-amber-400" />
                  <span>{num(allSlideImages.length)} {lang === 'km' ? 'ស្លាយរូប' : 'slides'}</span>
                </span>
              )}
            </div>

            {/* Right: Actions + Always-Visible Pinned Close Button (X) */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Media Toggle tabs on Desktop */}
              {hasImages && (
                <div className="hidden sm:flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveMediaView('thumbnail')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeMediaView === 'thumbnail'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'ស្លាយ Thumbnail' : 'Slides'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGalleryIndex(slideIndex);
                      setActiveMediaView('gallery');
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeMediaView === 'gallery'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Images className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'km' ? 'Slideshow' : 'Player'}</span>
                  </button>
                </div>
              )}

              {/* Edit button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(video);
                }}
                className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title={lang === 'km' ? 'កែសម្រួលមាតិកា (Edit)' : 'Edit content'}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Favorite button */}
              <button
                type="button"
                onClick={() => onToggleFavorite(video.id)}
                className={`p-1.5 sm:p-2 rounded-xl transition-colors cursor-pointer ${
                  video.isFavorite
                    ? 'text-amber-400 bg-amber-500/20 border border-amber-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={video.isFavorite ? 'ដកចេញពីចូលចិត្ត' : 'ដាក់ជាចូលចិត្ត'}
              >
                <Star className={`w-4 h-4 ${video.isFavorite ? 'fill-current' : ''}`} />
              </button>

              {/* Prominent, Pinned Close Button (X) - Never Overflowed */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-white hover:text-red-200 bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400/50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ml-1"
                title={lang === 'km' ? 'បិទផ្ទាំង (Close - Esc)' : 'Close (Esc)'}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Secondary Bar (for status and slide media toggle) */}
          <div className="sm:hidden px-3 py-1.5 border-t border-white/5 bg-black/20 flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${statusConfig.color} shrink-0`}>
                <span className={`w-1 h-1 rounded-full ${statusConfig.dot}`} />
                <span>{lang === 'km' ? statusConfig.km : statusConfig.en}</span>
              </span>
              {hasImages && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-2 py-0.5 rounded-md shrink-0">
                  {num(allSlideImages.length)} {lang === 'km' ? 'ស្លាយ' : 'slides'}
                </span>
              )}
            </div>

            {hasImages && (
              <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveMediaView('thumbnail')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    activeMediaView === 'thumbnail'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400'
                  }`}
                >
                  {lang === 'km' ? 'ស្លាយ' : 'Slides'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGalleryIndex(slideIndex);
                    setActiveMediaView('gallery');
                  }}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    activeMediaView === 'gallery'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400'
                  }`}
                >
                  {lang === 'km' ? 'បញ្ចាំង' : 'Player'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unified Scrollable Container: Thumbnail & Content Details scroll together smoothly */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Media Showcase: High-Definition Thumbnail or Photo Gallery */}
          <div className="relative aspect-video max-h-[380px] sm:max-h-[440px] w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-white/10 select-none">
            {activeMediaView === 'thumbnail' ? (
              <div
                className="relative w-full h-full flex items-center justify-center bg-slate-950 group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <img
                  key={currentSlideImage}
                  src={currentSlideImage}
                  alt={`${video.title} - Slide ${slideIndex + 1}`}
                  className="w-full h-full object-contain animate-in fade-in duration-300 transition-all select-none"
                  loading="eager"
                />

                {/* Left Slide Arrow */}
                {hasImages && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevSlide();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/80 hover:bg-indigo-600 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer z-20 opacity-80 hover:opacity-100 hover:scale-105"
                    title={lang === 'km' ? 'ស្លាយមុន (Previous Slide)' : 'Previous Slide'}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Slide Arrow */}
                {hasImages && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextSlide();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/80 hover:bg-indigo-600 text-white flex items-center justify-center border border-white/20 backdrop-blur-md transition-all shadow-xl active:scale-95 cursor-pointer z-20 opacity-80 hover:opacity-100 hover:scale-105"
                    title={lang === 'km' ? 'ស្លាយបន្ទាប់ (Next Slide)' : 'Next Slide'}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Badge Overlay with Auto-Slide Toggle */}
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-auto z-20 flex-wrap">
                  {hasImages ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/90 text-indigo-300 border border-indigo-400/30 backdrop-blur-md shadow-md">
                      <Images className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {lang === 'km'
                          ? `រូបភាពតំណាង Slide (${num(slideIndex + 1)} / ${num(allSlideImages.length)})`
                          : `Thumbnail Slide (${slideIndex + 1} of ${allSlideImages.length})`}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/85 text-indigo-300 border border-indigo-400/30 backdrop-blur-md shadow-md">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{lang === 'km' ? 'រូបភាពតំណាងមាតិកា (Thumbnail HD)' : 'Content Thumbnail HD'}</span>
                    </span>
                  )}

                  {/* Auto-Slide Toggle Button */}
                  {hasImages && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAutoSlide(!isAutoSlide);
                        setSlideProgress(0);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border transition-all cursor-pointer shadow-md ${
                        isAutoSlide
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 shadow-indigo-600/20'
                          : 'bg-slate-950/90 hover:bg-slate-900 text-slate-300 border-white/20'
                      }`}
                      title={
                        isAutoSlide
                          ? (lang === 'km' ? 'ចុចដើម្បីផ្អាក Auto Slide' : 'Click to pause Auto Slide')
                          : (lang === 'km' ? 'ចុចដើម្បីបើកដំណើរការ Auto Slide' : 'Click to start Auto Slide')
                      }
                    >
                      {isAutoSlide ? (
                        <>
                          <Pause className="w-3 h-3 text-amber-300" />
                          <span>{lang === 'km' ? 'Auto Slide: កំពុងរត់' : 'Auto: ON'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-indigo-400" />
                          <span>{lang === 'km' ? 'Auto Slide: បានផ្អាក' : 'Auto: OFF'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Top-Right Image Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                  <button
                    type="button"
                    onClick={handleCopyImageLink}
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all shadow-md cursor-pointer"
                    title={lang === 'km' ? 'ចម្លង Link រូបភាពស្លាយនេះ' : 'Copy current slide image link'}
                  >
                    {copiedImage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <a
                    href={currentSlideImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all shadow-md"
                    title={lang === 'km' ? 'បើករូបភាពទំហំធំពេញលេញ' : 'Open original image in new tab'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Pagination Dots at Bottom Center when multiple slides */}
                {hasImages && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 shadow-lg z-20">
                    {allSlideImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlideIndex(idx);
                          setSlideProgress(0);
                        }}
                        className={`h-2 rounded-full transition-all cursor-pointer ${
                          idx === slideIndex
                            ? 'w-5 bg-indigo-400 shadow-xs'
                            : 'w-2 bg-white/40 hover:bg-white/80'
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Bottom Quick Bar with Direct Platform Link - Desktop only to avoid overlapping dots on mobile */}
                <div className="hidden sm:flex absolute bottom-3 right-3 items-center justify-between pointer-events-auto z-20">
                  <a
                    href={cleanFacebookUrl(video.url || OFFICIAL_PAGE_INFO.officialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all border border-indigo-400/30 hover:scale-105"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>
                      {video.platform === 'facebook'
                        ? (lang === 'km' ? 'បើកមើលលើ Facebook' : 'Open on Facebook')
                        : (lang === 'km' ? 'បើកមើលលើ YouTube' : 'Open on YouTube')}
                    </span>
                  </a>
                </div>

                {/* Auto Slide Linear Progress Bar */}
                {hasImages && isAutoSlide && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20 overflow-hidden pointer-events-none">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-75 ease-linear"
                      style={{ width: `${Math.min(100, Math.max(0, slideProgress))}%` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Photo Gallery Slideshow */
              <PhotoGalleryPlayer
                images={allSlideImages}
                title={video.title}
                initialIndex={selectedGalleryIndex}
                lang={lang}
                onImageChange={setSelectedGalleryIndex}
              />
            )}
          </div>

          {/* Content Details Body (ព័ត៌មានលម្អិតបន្ថែមអំពីមាតិកា) */}
          <div className="p-4 sm:p-6 space-y-5">
          
          {/* Main Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-white leading-snug tracking-tight">
                {video.title}
              </h2>
              {video.titleEn && (
                <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                  {video.titleEn}
                </p>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors cursor-pointer"
                title="ចម្លងតំណភ្ជាប់ (Copy link)"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លង Link' : 'Copy Link')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(video);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-colors cursor-pointer"
                title="កែសម្រួលព័ត៌មានមាតិកា"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'km' ? 'កែសម្រួល' : 'Edit Details'}</span>
              </button>

              <a
                href={cleanFacebookUrl(video.url || OFFICIAL_PAGE_INFO.officialUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all border border-indigo-400/25 hover:scale-105"
                title="បើកមើលលើប្រភពដើម"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>
                  {video.platform === 'facebook'
                    ? (lang === 'km' ? 'បើកលើ Facebook' : 'Open on Facebook')
                    : (lang === 'km' ? 'បើកលើ YouTube' : 'Open on YouTube')}
                </span>
              </a>
            </div>
          </div>

          {/* Overview / Description Section */}
          <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap text-indigo-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {lang === 'km' ? 'ខ្លឹមសារសង្ខេប និងការពិពណ៌នាមាតិកា' : 'Overview & Description'}
                </h4>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line pt-1">
              {video.description || (lang === 'km' ? 'មិនមានការពិពណ៌នាបន្ថែមសម្រាប់មាតិកានេះទេ។' : 'No description provided.')}
            </p>
          </div>

          {/* Creator Notes & Production Insights */}
          {video.notes && (
            <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lang === 'km' ? 'កំណត់ចំណាំអ្នកផលិត (Creator Notes)' : 'Creator Notes & Insights'}</span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                {video.notes}
              </p>
            </div>
          )}

          {/* Technical Details & Publishing Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'km' ? 'ព័ត៌មានបច្ចេកទេស និងកាលបរិច្ឆេទ' : 'Technical & Publishing Info'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between sm:flex-col sm:items-start p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400">{lang === 'km' ? 'កាលបរិច្ឆេទបង្ហោះ' : 'Publish Date'}:</span>
                <span className="font-semibold font-mono text-white sm:mt-1">{num(video.publishDate)}</span>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400">{lang === 'km' ? 'ប្រភពផ្សាយ' : 'Platform'}:</span>
                <span className="font-semibold capitalize text-indigo-300 sm:mt-1">{video.platform}</span>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-start p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400">{lang === 'km' ? 'ប្រភេទមាតិកា' : 'Category'}:</span>
                <span className="font-semibold text-white sm:mt-1">{video.category}</span>
              </div>
            </div>
          </div>

          {/* Attached Photo Album / Slides Strip */}
          {hasImages && (
            <div className="bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-400/20">
                    <Images className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      {lang === 'km'
                        ? `ផ្ទាំងរូបភាពស្លាយទាំងអស់ (${num(allSlideImages.length)} រូប)`
                        : `All Thumbnail Slides (${allSlideImages.length})`}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'km'
                        ? 'ចុចលើរូបភាពណាមួយដើម្បីប្តូរស្លាយ ឬបើកមើលទំហំធំពេញលេញ'
                        : 'Click any photo to jump to slide or open full viewer'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedGalleryIndex(slideIndex);
                    setActiveMediaView('gallery');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Images className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'បើកផ្ទាំងរូបភាព Slideshow' : 'Open Slideshow'}</span>
                </button>
              </div>

              {/* Photo Strip Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                {allSlideImages.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSlideIndex(idx);
                      if (activeMediaView === 'gallery') {
                        setSelectedGalleryIndex(idx);
                      }
                    }}
                    className={`group relative aspect-video rounded-xl overflow-hidden border transition-all bg-slate-950 focus:outline-hidden cursor-pointer ${
                      idx === slideIndex && activeMediaView === 'thumbnail'
                        ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-102 shadow-lg'
                        : 'border-white/10 hover:border-white/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-transparent transition-colors flex items-end justify-between p-1.5">
                      <span className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-xs">
                        #{idx + 1}
                      </span>
                      {idx === 0 && (
                        <span className="bg-indigo-600/90 text-white px-1 py-0.2 rounded text-[9px] font-bold">
                          Cover
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-xs text-slate-400 font-medium">{lang === 'km' ? 'ស្លាកសម្គាល់៖' : 'Tags:'}</span>
              {video.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-full border border-white/10"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Mobile Bottom Close Button - Convenient for reading all the way down */}
          <div className="sm:hidden pt-3 pb-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 shadow-lg transition-all cursor-pointer"
            >
              <X className="w-4 h-4 text-slate-300" />
              <span>{lang === 'km' ? 'បិទផ្ទាំងព័ត៌មាន (Close)' : 'Close Details'}</span>
            </button>
          </div>
        </div>
        {/* End Unified Scrollable Container */}

        {/* Floating Mini Auto-Slide Preview when reading article - Visible only on tablet/desktop (sm+) so it NEVER overlaps or blocks article text on mobile */}
        {isReadingScrolled && hasImages && showPiP && (
          <div className="hidden sm:block absolute bottom-4 right-4 z-40 bg-slate-900/95 border border-indigo-500/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl max-w-[260px] sm:max-w-[280px] w-full animate-in slide-in-from-bottom-4 duration-200 text-white">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-300">
                <span className={`w-2 h-2 rounded-full ${isAutoSlide && !isHovered ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                <span>{lang === 'km' ? 'Auto Slide ពេលអានអត្ថបទ' : 'Auto Slide Reading'}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="p-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  title={lang === 'km' ? 'រមូរឡើងលើដើម្បីមើលរូបធំ' : 'Scroll to top to view main stage'}
                >
                  <ArrowUp className="w-3 h-3 text-indigo-400" />
                  <span>{lang === 'km' ? 'មើលធំ' : 'Top'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPiP(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  title={lang === 'km' ? 'បិទផ្ទាំងតូច' : 'Dismiss mini-player'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mini Slide Image with auto transition */}
            <div
              className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-white/10 group cursor-pointer"
              onClick={scrollToTop}
            >
              <img
                key={`pip-${currentSlideImage}`}
                src={currentSlideImage}
                alt="Mini slide preview"
                className="w-full h-full object-cover animate-in fade-in duration-200 select-none"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
              </div>
              <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded text-white border border-white/10">
                {num(slideIndex + 1)} / {num(allSlideImages.length)}
              </span>
              {isAutoSlide && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-indigo-600/90 text-[9px] font-bold text-white shadow-xs">
                  Auto
                </div>
              )}
            </div>

            {/* Mini Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    goToPrevSlide();
                    setSlideProgress(0);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 cursor-pointer transition-colors"
                  title={lang === 'km' ? 'ស្លាយមុន' : 'Previous'}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoSlide(!isAutoSlide);
                    setSlideProgress(0);
                  }}
                  className={`p-1.5 px-2 rounded-lg flex items-center gap-1 text-[11px] font-semibold cursor-pointer transition-colors ${
                    isAutoSlide
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200'
                  }`}
                  title={isAutoSlide ? 'ផ្អាក Auto' : 'បន្ត Auto'}
                >
                  {isAutoSlide ? <Pause className="w-3 h-3 text-amber-300" /> : <Play className="w-3 h-3 text-indigo-400" />}
                  <span>{isAutoSlide ? (lang === 'km' ? 'ផ្អាក' : 'Pause') : (lang === 'km' ? 'បន្ត' : 'Play')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    goToNextSlide();
                    setSlideProgress(0);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-200 cursor-pointer transition-colors"
                  title={lang === 'km' ? 'ស្លាយបន្ទាប់' : 'Next'}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] text-slate-400 font-medium font-mono">
                {lang === 'km' ? 'កំពុងអាន' : 'Reading'}
              </span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export const PlayerModal: React.FC<PlayerModalProps> = ({
  video,
  onClose,
  onEdit,
  onToggleFavorite,
  lang,
}) => {
  if (!video) return null;

  return (
    <PlayerModalContent
      video={video}
      onClose={onClose}
      onEdit={onEdit}
      onToggleFavorite={onToggleFavorite}
      lang={lang}
    />
  );
};
