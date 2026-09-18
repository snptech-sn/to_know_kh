import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ExternalLink,
  Images,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { toKhmerNumerals } from '../utils/videoHelper';

interface PhotoGalleryPlayerProps {
  images: string[];
  title: string;
  initialIndex?: number;
  lang: 'km' | 'en';
  onImageChange?: (index: number) => void;
}

export const PhotoGalleryPlayer: React.FC<PhotoGalleryPlayerProps> = ({
  images,
  title,
  initialIndex = 0,
  lang,
  onImageChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => {
      const next = (prev + 1) % images.length;
      onImageChange?.(next);
      return next;
    });
  }, [images.length, onImageChange]);

  const goToPrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => {
      const prevIdx = prev === 0 ? images.length - 1 : prev - 1;
      onImageChange?.(prevIdx);
      return prevIdx;
    });
  }, [images.length, onImageChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        <div className="flex flex-col items-center gap-2">
          <Images className="w-8 h-8 text-slate-600" />
          <span>{lang === 'km' ? 'គ្មានរូបភាពក្នុងអាល់ប៊ុម' : 'No photos in album'}</span>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex] || images[0];
  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentImage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative w-full h-full bg-slate-950 flex flex-col items-center justify-center select-none ${
        isFullscreen ? 'fixed inset-0 z-50 p-4 bg-black/95 backdrop-blur-2xl' : ''
      }`}
    >
      {/* Main Image Stage */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[380px]">
        <img
          key={currentImage}
          src={currentImage}
          alt={`${title} - ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain animate-in fade-in zoom-in-95 duration-200"
        />

        {/* Top Badges & Controls */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-950/85 text-white border border-white/20 backdrop-blur-md shadow-md">
            <Images className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {lang === 'km'
                ? `រូបភាពទី ${num(currentIndex + 1)} / ${num(images.length)}`
                : `Photo ${currentIndex + 1} of ${images.length}`}
            </span>
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all shadow-md"
            title={lang === 'km' ? 'ចម្លងតំណភ្ជាប់រូបភាព' : 'Copy image link'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all shadow-md"
            title={lang === 'km' ? 'បើករូបភាពទំហំធំពេញលេញ' : 'Open original image'}
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all shadow-md"
            title={isFullscreen ? 'បង្រួមធម្មតា' : 'ពង្រីកពេញអេក្រង់'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={goToPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-indigo-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-90"
            title={lang === 'km' ? 'រូបភាពមុន (Left Arrow)' : 'Previous photo'}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-indigo-600 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-xl active:scale-90"
            title={lang === 'km' ? 'រូបភាពបន្ទាប់ (Right Arrow)' : 'Next photo'}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="w-full bg-slate-950/90 border-t border-white/10 px-3 py-2 flex items-center justify-center gap-2 overflow-x-auto shrink-0">
          {images.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  onImageChange?.(idx);
                }}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                  isActive
                    ? 'border-indigo-400 ring-2 ring-indigo-400/40 scale-105 shadow-md'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                <span className="absolute bottom-0.5 right-0.5 bg-black/75 px-1 rounded text-[9px] font-mono text-white font-bold">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
