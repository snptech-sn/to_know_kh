import React, { useState, useRef } from 'react';
import {
  Upload,
  Link2,
  Plus,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Images,
  Check,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { PRESET_GALLERY_ALBUMS } from '../data/presetGalleries';
import { toKhmerNumerals } from '../utils/videoHelper';
import { compressMultipleImageFiles } from '../utils/imageCompressor';

interface ImageGalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  thumbnail: string;
  onSetThumbnail: (url: string) => void;
  lang: 'km' | 'en';
}

export const ImageGalleryManager: React.FC<ImageGalleryManagerProps> = ({
  images,
  onChange,
  thumbnail,
  onSetThumbnail,
  lang,
}) => {
  const [inputTab, setInputTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // 1. Direct Upload: Handle Multiple Files with automatic client-side compression
  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      showStatus(lang === 'km' ? 'សូមជ្រើសរើសឯកសារដែលជារូបភាព (JPG, PNG, WEBP)' : 'Please select valid image files');
      return;
    }

    setIsProcessingFiles(true);
    try {
      const compressedImages = await compressMultipleImageFiles(fileArray);
      if (compressedImages.length > 0) {
        const updated = [...images, ...compressedImages];
        onChange(updated);
        // If no thumbnail set yet or using placeholder, set the first uploaded image as cover
        if (!thumbnail || thumbnail.includes('unsplash.com/photo-1618005182384')) {
          onSetThumbnail(updated[0]);
        }
        setActivePreviewIndex(images.length); // jump to newly added image
        showStatus(
          lang === 'km'
            ? `បានបញ្ចូល ${num(compressedImages.length)} រូបភាពទៅក្នុង Slide ដោយជោគជ័យ!`
            : `Added ${compressedImages.length} images to slide successfully!`
        );
      }
    } catch (err) {
      console.error('Failed to compress images:', err);
      showStatus(lang === 'km' ? 'មានបញ្ហាក្នុងការដំណើរការរូបភាព' : 'Error processing images');
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // 2. Add Single URL
  const handleAddSingleUrl = () => {
    const trimmed = singleUrl.trim();
    if (!trimmed) return;
    if (images.includes(trimmed)) {
      showStatus(lang === 'km' ? 'រូបភាពនេះមានក្នុង Slide រួចហើយ' : 'Image is already in the slide');
      return;
    }
    const updated = [...images, trimmed];
    onChange(updated);
    if (!thumbnail) {
      onSetThumbnail(trimmed);
    }
    setSingleUrl('');
    setActivePreviewIndex(updated.length - 1);
    showStatus(lang === 'km' ? 'បានបន្ថែមកំណត់តំណភ្ជាប់រូបភាពក្នុង Slide រួចរាល់' : 'Image URL added to slide');
  };

  // 3. Add Bulk URLs
  const handleAddBulkUrls = () => {
    const lines = bulkUrls
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http://') || l.startsWith('https://') || l.startsWith('data:image/'));

    if (lines.length === 0) {
      showStatus(lang === 'km' ? 'សូមបញ្ចូលតំណភ្ជាប់រូបភាពយ៉ាងហោចណាស់មួយ' : 'Please provide at least one valid image URL');
      return;
    }

    const uniqueNew = lines.filter((url) => !images.includes(url));
    const updated = [...images, ...uniqueNew];
    onChange(updated);
    if (!thumbnail && updated.length > 0) {
      onSetThumbnail(updated[0]);
    }
    setBulkUrls('');
    setActivePreviewIndex(updated.length - 1);
    showStatus(
      lang === 'km'
        ? `បានបញ្ចូល ${num(uniqueNew.length)} រូបភាពតាមតំណភ្ជាប់ទៅក្នុង Slide!`
        : `Added ${uniqueNew.length} images from links to slide!`
    );
  };

  // 4. Preset Album
  const handleApplyPreset = (albumImages: string[]) => {
    const uniqueNew = albumImages.filter((url) => !images.includes(url));
    const updated = [...images, ...uniqueNew];
    onChange(updated);
    if (!thumbnail && updated.length > 0) {
      onSetThumbnail(updated[0]);
    }
    setActivePreviewIndex(0);
    showStatus(
      lang === 'km'
        ? `បានបញ្ចូលអាល់ប៊ុម Slide គំរូ (${num(uniqueNew.length)} រូប)!`
        : `Preset slide album applied (${uniqueNew.length} photos)!`
    );
  };

  // Management Actions
  const handleRemoveImage = (index: number) => {
    const targetUrl = images[index];
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
    if (thumbnail === targetUrl) {
      onSetThumbnail(updated[0] || '');
    }
    if (activePreviewIndex >= updated.length) {
      setActivePreviewIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleMoveImage = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChange(copy);
    setActivePreviewIndex(targetIdx);
  };

  const handleClearAll = () => {
    if (images.length === 0) return;
    onChange([]);
    onSetThumbnail('');
    setActivePreviewIndex(0);
    showStatus(lang === 'km' ? 'បានសម្អាតរូបភាព Slide ទាំងអស់' : 'Cleared all slide images');
  };

  const safePreviewIndex = Math.min(activePreviewIndex, Math.max(0, images.length - 1));
  const activeImage = images[safePreviewIndex] || thumbnail || '';
  const isCurrentActiveCover = activeImage && thumbnail === activeImage;

  return (
    <div className="bg-white/5 p-4 sm:p-5 rounded-2xl border border-white/10 space-y-4">
      {/* Header with counter */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-400/20 shadow-inner">
            <Images className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <span>{lang === 'km' ? 'រូបភាពតំណាងជា Slide (Thumbnail & Slide Images)' : 'Thumbnail & Slide Images'}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {lang === 'km' ? 'Slide រូបភាព' : 'Photo Slide'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {lang === 'km'
                ? 'Admin អាចបន្ថែមរូបភាពជាច្រើនសម្រាប់ Slide គម្រប ដោយផ្ទុកឡើងផ្ទាល់ពីឧបករណ៍ ឬតាមតំណភ្ជាប់'
                : 'Upload multiple images from device or via links to create an interactive thumbnail slide'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            {num(images.length)} {lang === 'km' ? 'រូបភាពក្នុង Slide' : 'Slide Photos'}
          </span>
          {images.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-slate-400 hover:text-red-300 transition-colors underline cursor-pointer"
            >
              {lang === 'km' ? 'សម្អាតទាំងអស់' : 'Clear all'}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Slide Live Preview inside Admin if images exist */}
      {images.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/15 aspect-video max-h-[240px] flex items-center justify-center group select-none shadow-xl">
          <img
            src={activeImage}
            alt={`Slide Preview ${safePreviewIndex + 1}`}
            className="w-full h-full object-contain"
          />

          {/* Slide Navigation in Admin */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setActivePreviewIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-indigo-600 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
                title={lang === 'km' ? 'ស្លាយមុន' : 'Previous Slide'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewIndex((prev) => (prev + 1) % images.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-indigo-600 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-md"
                title={lang === 'km' ? 'ស្លាយបន្ទាប់' : 'Next Slide'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950/85 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
              <Images className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {lang === 'km'
                  ? `មើលសាកល្បង Slide (${num(safePreviewIndex + 1)} / ${num(images.length)})`
                  : `Slide Preview (${safePreviewIndex + 1} of ${images.length})`}
              </span>
            </span>
          </div>

          {/* Cover Status & Set Cover Button on Top Right */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {isCurrentActiveCover ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 shadow-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'km' ? 'រូបគម្របចម្បង (Cover)' : 'Main Cover'}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSetThumbnail(activeImage)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/90 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/40 backdrop-blur-md transition-all shadow-md cursor-pointer"
                title={lang === 'km' ? 'កំណត់រូបនេះជារូបគម្របចម្បង (Thumbnail)' : 'Set as main thumbnail cover'}
              >
                <Star className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'ដាក់ជារូបគម្រប' : 'Set as Cover'}</span>
              </button>
            )}
          </div>

          {/* Bottom Dots in Admin Preview */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safePreviewIndex
                      ? 'w-5 bg-indigo-500'
                      : 'w-1.5 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Mode Tabs: Upload / Link / Presets */}
      <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/10 gap-1 text-xs">
        <button
          type="button"
          onClick={() => setInputTab('upload')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            inputTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'ផ្ទុកឡើងពីឧបករណ៍ផ្ទាល់' : 'Upload from Device'}</span>
        </button>

        <button
          type="button"
          onClick={() => setInputTab('url')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            inputTab === 'url'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'តាមតំណភ្ជាប់ (Links)' : 'Via Links'}</span>
        </button>

        <button
          type="button"
          onClick={() => setInputTab('presets')}
          className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            inputTab === 'presets'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{lang === 'km' ? 'រូប Slide គំរូ' : 'Preset Slides'}</span>
        </button>
      </div>

      {/* Tab 1: Direct Upload from Device */}
      {inputTab === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelected(e.target.files);
                e.target.value = ''; // reset so same files can be re-added if desired
              }
            }}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragOver
                ? 'border-indigo-400 bg-indigo-500/20'
                : 'border-white/15 hover:border-indigo-400/50 bg-slate-950/50 hover:bg-slate-950/80'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center border border-indigo-400/30 shadow-inner">
                {isProcessingFiles ? (
                  <div className="w-5 h-5 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {lang === 'km'
                    ? 'ចុចទីនេះដើម្បីជ្រើសរើសរូបភាព Slide ពីទូរស័ព្ទ/កុំព្យូទ័រ'
                    : 'Click to select multiple slide photos from device'}
                </p>
                <p className="text-[11px] text-indigo-300 mt-1">
                  {lang === 'km'
                    ? '★ អាចជ្រើសរើសរូបភាពច្រើនក្នុងពេលតែមួយ ឬអូសទម្លាក់រូបចូលទីនេះ'
                    : '★ Multi-select supported: select multiple images at once or drag & drop'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  JPG, PNG, WEBP, GIF (ផ្ទុកឡើងបានលឿន និងរក្សាគុណភាពច្បាស់)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Via Link (Single & Bulk) */}
      {inputTab === 'url' && (
        <div className="space-y-3">
          {/* Single URL Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-300">
              {lang === 'km' ? 'បញ្ចូលតំណភ្ជាប់រូបភាពមួយៗ (Single Image Link):' : 'Single Image Link:'}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSingleUrl();
                  }
                }}
                placeholder="https://images.unsplash.com/... ឬ direct image link"
                className="flex-1 px-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:border-indigo-400 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSingleUrl}
                disabled={!singleUrl.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'បន្ថែមក្នុង Slide' : 'Add to Slide'}</span>
              </button>
            </div>
          </div>

          {/* Bulk Links Textarea */}
          <div className="space-y-1 pt-2 border-t border-white/5">
            <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
              <span>{lang === 'km' ? 'ឬ បិទភ្ជាប់តំណភ្ជាប់ច្រើនក្នុងពេលតែមួយ (Bulk Links):' : 'Or paste multiple links at once:'}</span>
              <span className="text-[10px] text-slate-500">{lang === 'km' ? '១ បន្ទាត់ = ១ រូប' : '1 line per image'}</span>
            </label>
            <textarea
              rows={2}
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
              className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:border-indigo-400 outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddBulkUrls}
                disabled={!bulkUrls.trim()}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-semibold transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'km' ? 'បន្ថែមតំណភ្ជាប់ទាំងអស់' : 'Add all links'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preset Slide Albums */}
      {inputTab === 'presets' && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-400">
            {lang === 'km'
              ? 'ចុចលើអាល់ប៊ុមណាមួយខាងក្រោមដើម្បីបញ្ចូលផ្ទាំងរូបភាព Slide គំរូល្អៗភ្លាមៗ៖'
              : 'Click any pack below to instantly add high-definition sample slide thumbnails:'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_GALLERY_ALBUMS.map((album) => (
              <button
                key={album.id}
                type="button"
                onClick={() => handleApplyPreset(album.images)}
                className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-950 hover:border-indigo-400/40 border border-white/10 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative border border-white/10">
                  <img
                    src={album.images[0]}
                    alt={album.nameKm}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-0 right-0 bg-black/75 px-1 text-[9px] text-white font-bold rounded-tl">
                    +{album.images.length}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {lang === 'km' ? album.nameKm : album.nameEn}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {album.category} • {num(album.images.length)} {lang === 'km' ? 'រូប' : 'photos'}
                  </p>
                </div>
                <Plus className="w-4 h-4 text-indigo-400 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Uploaded Slide Images Grid & Management */}
      {images.length > 0 ? (
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {lang === 'km'
                  ? 'គ្រប់គ្រងលំដាប់រូបភាពក្នុង Slide (ចុចលើរូបដើម្បីមើល ឬចុច ★ ដាក់ជាគម្របចម្បង)៖'
                  : 'Manage Slide Images (Click to preview, click ★ to set as main cover):'}
              </span>
            </span>
            <span className="font-mono text-[11px] text-indigo-300 font-bold">{num(images.length)}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {images.map((imgUrl, idx) => {
              const isCover = thumbnail === imgUrl;
              const isCurrentPreview = idx === safePreviewIndex;
              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`group relative rounded-xl overflow-hidden aspect-square bg-slate-900 border transition-all cursor-pointer ${
                    isCover
                      ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                      : isCurrentPreview
                      ? 'border-indigo-400 ring-1 ring-indigo-400/40'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Index Pill */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono font-bold text-white backdrop-blur-xs">
                    #{num(idx + 1)}
                  </span>

                  {/* Cover Badge */}
                  {isCover && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-[9px] font-bold text-slate-950 flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{lang === 'km' ? 'រូបគម្រប' : 'Cover'}</span>
                    </span>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetThumbnail(imgUrl);
                          showStatus(lang === 'km' ? `បានកំណត់រូបភាពទី ${num(idx + 1)} ជារូបគម្របចម្បង` : `Set photo #${idx + 1} as main cover`);
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isCover
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-white'
                        }`}
                        title={lang === 'km' ? 'កំណត់ជារូបគម្រប (Set as Cover)' : 'Set as Cover'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isCover ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/30 hover:bg-red-500 text-red-200 hover:text-white transition-colors cursor-pointer"
                        title={lang === 'km' ? 'លុបរូបភាពនេះពី Slide' : 'Remove from slide'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveImage(idx, -1);
                        }}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title={lang === 'km' ? 'ផ្លាស់ទីទៅមុខ' : 'Move forward'}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveImage(idx, 1);
                        }}
                        className="p-1 rounded-lg bg-white/10 hover:bg-white/25 text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title={lang === 'km' ? 'ផ្លាស់ទីទៅក្រោយ' : 'Move backward'}
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-5 px-3 rounded-xl bg-slate-950/30 border border-white/5 text-slate-400 text-xs">
          <p className="font-semibold text-white/80">{lang === 'km' ? 'មិនទាន់មានរូបភាពក្នុង Slide នៅឡើយទេ' : 'No slide thumbnails attached yet'}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === 'km'
              ? 'សូមជ្រើសរើសរូបភាពពីទូរស័ព្ទ/កុំព្យូទ័រ ឬបញ្ចូលតំណភ្ជាប់ខាងលើដើម្បីបង្កើត Slide រូបភាព'
              : 'Upload files from device or paste links above to create your thumbnail slide'}
          </p>
        </div>
      )}
    </div>
  );
};

