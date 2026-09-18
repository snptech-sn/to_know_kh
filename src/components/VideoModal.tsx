import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Link2,
  FileEdit,
  Sparkles,
  Check,
  Image as ImageIcon,
  Upload,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  Share2,
  Tag,
  Play,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  AlertCircle,
  Images,
} from 'lucide-react';
import { VideoItem, VideoCategory, VideoPlatform, VideoStatus, MediaType } from '../types/video';
import {
  detectPlatform,
  getEmbedUrl,
  getYouTubeThumbnail,
  suggestCategoryFromKeywords,
  cleanFacebookUrl,
  getFacebookEmbedUrl,
  extractFacebookVideoInfo,
} from '../utils/videoHelper';
import { OFFICIAL_PAGE_INFO } from '../data/initialVideos';
import { ImageGalleryManager } from './ImageGalleryManager';
import { compressImageFile } from '../utils/imageCompressor';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (video: VideoItem) => void;
  editVideo: VideoItem | null;
  lang: 'km' | 'en';
  defaultTab?: 'link' | 'manual';
}

const CATEGORIES: VideoCategory[] = [
  'បច្ចេកវិទ្យា',
  'វិទ្យាសាស្ត្រ',
  'ចំណេះដឹងទូទៅ',
  'ប្រវត្តិសាស្ត្រ',
  'សុខភាព & ខួរក្បាល',
  'គន្លឹះខ្លីៗ',
];

const THUMBNAIL_PRESETS = [
  { label: 'Technology / AI', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
  { label: 'Space & Universe', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80' },
  { label: 'Science / Lab', url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&auto=format&fit=crop&q=80' },
  { label: 'Nature / Earth', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop&q=80' },
  { label: 'History / World', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80' },
  { label: 'Shorts & Tips', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80' },
];

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editVideo,
  lang,
  defaultTab = 'link',
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'manual'>(defaultTab);

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<VideoCategory>('បច្ចេកវិទ្យា');
  const [status, setStatus] = useState<VideoStatus>('published');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [duration, setDuration] = useState('04:30');
  const [views, setViews] = useState(1200);
  const [likes, setLikes] = useState(150);
  const [shares, setShares] = useState(35);
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState({
    script: true,
    voiceover: true,
    thumbnailDone: true,
    subtitles: true,
  });

  // Multiple Images / Gallery State
  const [images, setImages] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<MediaType>('video');

  // Helper State
  const [detectedPlatform, setDetectedPlatform] = useState<VideoPlatform>('facebook');
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [isExtractingVideo, setIsExtractingVideo] = useState(false);
  const [extractStatusText, setExtractStatusText] = useState<string | null>(null);
  const [imageUploadName, setImageUploadName] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [videoUploadName, setVideoUploadName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Set default tab and values on open or edit
  useEffect(() => {
    if (editVideo) {
      setTitle(editVideo.title);
      setTitleEn(editVideo.titleEn || '');
      setUrl(editVideo.url);
      setPreviewVideoUrl(editVideo.previewVideoUrl || '');
      setCategory(editVideo.category);
      setStatus(editVideo.status);
      setDescription(editVideo.description);
      setThumbnail(editVideo.thumbnail);
      const initialImages = editVideo.images && editVideo.images.length > 0
        ? editVideo.images
        : (editVideo.thumbnail ? [editVideo.thumbnail] : []);
      setImages(initialImages);
      setMediaType(editVideo.mediaType || (initialImages.length > 1 ? 'mixed' : 'video'));
      setDuration(editVideo.duration);
      setViews(editVideo.views);
      setLikes(editVideo.likes);
      setShares(editVideo.shares);
      setPublishDate(editVideo.publishDate);
      setTagsInput(editVideo.tags.join(', '));
      setNotes(editVideo.notes || '');
      setChecklist(
        editVideo.creatorChecklist || {
          script: true,
          voiceover: true,
          thumbnailDone: true,
          subtitles: true,
        },
      );
      setDetectedPlatform(editVideo.platform);
      setIsPlayingPreview(false);
      setActiveTab('manual'); // When editing, default to manual view for full control
    } else {
      // Reset for new creation
      setTitle('');
      setTitleEn('');
      setUrl('');
      setPreviewVideoUrl('');
      const defaultThumb = THUMBNAIL_PRESETS[0].url;
      setThumbnail(defaultThumb);
      setImages([defaultThumb]);
      setMediaType('video');
      setIsPlayingPreview(false);
      setVideoUploadName('');
      setCategory('បច្ចេកវិទ្យា');
      setStatus('published');
      setDescription('');
      setDuration('04:30');
      setViews(650);
      setLikes(80);
      setShares(15);
      setPublishDate(new Date().toISOString().split('T')[0]);
      setTagsInput('នាំដឹង, ចំណេះដឹង, បច្ចេកវិទ្យា');
      setNotes('');
      setChecklist({
        script: true,
        voiceover: false,
        thumbnailDone: false,
        subtitles: false,
      });
      setDetectedPlatform('facebook');
      setActiveTab(defaultTab);
    }
  }, [editVideo, isOpen, defaultTab]);

  // Video Extraction from Backend API
  const extractVideoFromUrl = async (targetUrl: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) return;

    setIsExtractingVideo(true);
    setExtractStatusText(
      lang === 'km'
        ? 'កំពុងទាញយកវីដេអូពី Facebook មកចាក់លើកម្មវិធី...'
        : 'Fetching and extracting Facebook video stream...',
    );

    try {
      const res = await fetch('/api/extract-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        if (data.canonicalUrl) {
          setUrl(data.canonicalUrl);
        }
        if (data.title) {
          setTitle(data.title);
        }
        if (data.description) {
          setDescription(data.description);
        }
        if (data.thumbnail) {
          setThumbnail(data.thumbnail);
        }
        if (data.directVideoUrl) {
          setPreviewVideoUrl(data.directVideoUrl);
          setIsPlayingPreview(true); // Auto-open preview to test play
        }
        if (data.isReel) {
          setCategory('គន្លឹះខ្លីៗ');
        } else if (data.title) {
          setCategory(suggestCategoryFromKeywords(data.title));
        }
        if (data.platform) {
          setDetectedPlatform(data.platform);
        }

        setExtractStatusText(
          data.directVideoUrl
            ? (lang === 'km'
                ? '✅ បានទាញយកវីដេអូ MP4 ជោគជ័យ! អាចចាក់លេងលើកម្មវិធីបានភ្លាមៗ'
                : '✅ Video stream extracted! Playable directly in app.')
            : (lang === 'km'
                ? '✅ បានទាញយកតំណភ្ជាប់ Facebook ជោគជ័យ! អាចចាក់លេងលើកម្មវិធីបាន'
                : '✅ Facebook video link extracted and ready to play.'),
        );
      }
    } catch (err: any) {
      console.warn('Backend extract error:', err);
      // Fallback to local parsing
      const plat = detectPlatform(trimmed);
      setDetectedPlatform(plat);
      if (plat === 'facebook') {
        const fbInfo = extractFacebookVideoInfo(trimmed);
        if (fbInfo.isReel) setCategory('គន្លឹះខ្លីៗ');
        if (!title) {
          setTitle(fbInfo.isReel ? 'វីដេអូខ្លីចំណេះដឹង (Reels) - នាំដឹង' : 'វីដេអូចំណេះដឹងពីទំព័រហ្វេសប៊ុក នាំដឹង - To Know');
        }
        setExtractStatusText(lang === 'km' ? '✅ បានរៀបចំតំណភ្ជាប់ Facebook រួចរាល់' : '✅ Facebook link prepared');
      } else if (plat === 'youtube') {
        const ytThumb = getYouTubeThumbnail(trimmed);
        if (ytThumb) setThumbnail(ytThumb);
        setExtractStatusText(lang === 'km' ? '✅ បានរកឃើញវីដេអូ YouTube' : '✅ YouTube video detected');
      }
    } finally {
      setIsExtractingVideo(false);
    }
  };

  // URL auto detector
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setIsPlayingPreview(false);
    if (!newUrl.trim()) {
      setExtractStatusText(null);
      return;
    }

    const plat = detectPlatform(newUrl);
    setDetectedPlatform(plat);

    // Auto-extract if it's a full Facebook, YouTube, or direct link
    if (
      newUrl.includes('facebook.com') ||
      newUrl.includes('fb.watch') ||
      newUrl.includes('youtu') ||
      newUrl.endsWith('.mp4')
    ) {
      extractVideoFromUrl(newUrl);
    }
  };

  useEffect(() => {
    if (url.trim()) {
      const plat = detectPlatform(url);
      setDetectedPlatform(plat);
    }
  }, [url]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Link auto-fill handler (Trigger manual re-extraction)
  const handleAutoFillFromUrl = () => {
    if (!url.trim()) return;
    extractVideoFromUrl(url);
  };

  // Image Upload handler (supports mobile camera or gallery) with compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUploadName(file.name);
      try {
        const compressed = await compressImageFile(file);
        if (compressed) {
          setThumbnail(compressed);
        }
      } catch (err) {
        console.error('Failed to compress image:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setThumbnail(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Video File Upload handler (MP4/WebM)
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUploadName(file.name);
      const objectUrl = URL.createObjectURL(file);
      setPreviewVideoUrl(objectUrl);
      setDetectedPlatform('direct');
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  // Preset link helpers
  const handleApplyOfficialLink = () => {
    handleUrlChange(OFFICIAL_PAGE_INFO.officialUrl);
    setTitle('វីដេអូចំណេះដឹងថ្មីពីទំព័រ នាំដឹង - To Know');
    setDescription('វីដេអូចែករំលែកចំណេះដឹង បច្ចេកវិទ្យា និងវិទ្យាសាស្ត្រពីទំព័រហ្វេសប៊ុកផ្លូវការ "នាំដឹង - To Know"។');
    setCategory('បច្ចេកវិទ្យា');
    setThumbnail(THUMBNAIL_PRESETS[0].url);
  };

  const handleApplySampleYoutube = () => {
    handleUrlChange('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setTitle('បទបង្ហាញអំពីបច្ចេកវិទ្យាជំនាន់ថ្មី និងបញ្ញាសិប្បនិម្មិត');
    setCategory('បច្ចេកវិទ្យា');
    setThumbnail('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    setDescription('ការវិវត្តយ៉ាងលឿននៃបច្ចេកវិទ្យា និងការត្រៀមខ្លួនសម្រាប់អនាគត។');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Determine final media type
    const finalMediaType: MediaType =
      images.length > 0 && (url.trim() || previewVideoUrl.trim())
        ? 'mixed'
        : images.length > 0
        ? 'gallery'
        : 'video';

    // Safe URL sanitization: never allow raw base64 data URLs to become videoItem.url!
    const userUrl = url.trim();
    const isUserUrlValid = userUrl.length >= 5 && (userUrl.startsWith('http://') || userUrl.startsWith('https://'));
    const firstValidHttpImage = images.find(
      (img) => img.startsWith('http') && !img.startsWith('data:') && !img.startsWith('blob:')
    );

    const safeUrl = isUserUrlValid
      ? userUrl
      : (firstValidHttpImage || OFFICIAL_PAGE_INFO.officialUrl);

    const detected = detectPlatform(safeUrl);
    const finalUrl = detected === 'facebook' ? cleanFacebookUrl(safeUrl) : safeUrl;
    const rawEmbed = getEmbedUrl(finalUrl);
    // Ensure embed is not a data/blob url
    const embed = rawEmbed && !rawEmbed.startsWith('data:') && !rawEmbed.startsWith('blob:') ? rawEmbed : undefined;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    const finalThumbnail =
      thumbnail.trim() || (images.length > 0 ? images[0] : THUMBNAIL_PRESETS[0].url);

    let finalImages = [...images];
    if (finalThumbnail && !finalImages.includes(finalThumbnail)) {
      finalImages = [finalThumbnail, ...finalImages];
    }

    const videoItem: VideoItem = {
      id: editVideo ? editVideo.id : `tk-${Date.now()}`,
      title: title.trim(),
      titleEn: titleEn.trim() || undefined,
      url: finalUrl,
      embedUrl: embed,
      previewVideoUrl:
        previewVideoUrl.trim() && !previewVideoUrl.startsWith('blob:')
          ? previewVideoUrl.trim()
          : editVideo?.previewVideoUrl || (detected === 'direct' ? finalUrl : undefined),
      platform: detected,
      mediaType: finalMediaType,
      images: finalImages,
      category,
      description: description.trim() || (lang === 'km' ? 'វីដេអូចំណេះដឹងពីទំព័រ នាំដឹង - To Know' : 'Educational content from To Know'),
      thumbnail: finalThumbnail,
      duration: duration.trim() || '04:00',
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      shares: Number(shares) || 0,
      publishDate,
      status,
      tags: tags.length > 0 ? tags : ['នាំដឹង', 'ចំណេះដឹង', 'បច្ចេកវិទ្យា'],
      isFavorite: editVideo ? editVideo.isFavorite : false,
      notes: notes.trim(),
      creatorChecklist: checklist,
    };

    onSave(videoItem);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-white/15 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>
                {editVideo
                  ? lang === 'km'
                    ? 'កែសម្រួលព័ត៌មានវីដេអូ'
                    : 'Edit Video'
                  : lang === 'km'
                    ? 'បន្ថែមវីដេអូថ្មី'
                    : 'Add New Video'}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Admin
              </span>
            </h2>
            <p className="text-xs text-slate-400 line-clamp-1">
              {lang === 'km'
                ? 'គ្រប់គ្រងព័ត៌មានវីដេអូសម្រាប់ទំព័រ នាំដឹង - To Know (Facebook & Cloud)'
                : 'Manage video data for To Know Facebook page & Cloud'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white hover:text-red-200 bg-white/10 hover:bg-red-500/30 border border-white/20 hover:border-red-400/50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ml-2 shrink-0"
            title={lang === 'km' ? 'បិទផ្ទាំង (Close - Esc)' : 'Close (Esc)'}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Link vs Manual) */}
        {!editVideo && (
          <div className="px-5 sm:px-6 pt-3 pb-1 border-b border-white/10 bg-slate-950/40 shrink-0">
            <div className="flex items-center gap-2">
              {/* Tab 1: Via Link */}
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                  activeTab === 'link'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-400/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border-white/10'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>{lang === 'km' ? 'បញ្ចូលតាមតំណភ្ជាប់ (Link)' : 'Add via Link / URL'}</span>
              </button>

              {/* Tab 2: Manual Input */}
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                  activeTab === 'manual'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-indigo-400/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border-white/10'
                }`}
              >
                <FileEdit className="w-4 h-4" />
                <span>{lang === 'km' ? 'បញ្ចូលដោយដៃ (Manual Input)' : 'Manual Entry Form'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm">
          {/* ==================== TAB 1: VIA LINK ==================== */}
          {activeTab === 'link' && !editVideo && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* URL Input Box */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs sm:text-sm">
                    <Link2 className="w-4 h-4 text-indigo-400" />
                    <span>{lang === 'km' ? 'បិទភ្ជាប់តំណភ្ជាប់វីដេអូ (Paste Video URL) *' : 'Paste Video URL *'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillFromUrl}
                    disabled={!url.trim() || isAutoDetecting}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAutoDetecting ? 'កំពុងវិភាគ...' : lang === 'km' ? 'វិភាគ & បំពេញស្វ័យប្រវត្តិ' : 'Analyze & Auto-fill'}</span>
                  </button>
                </div>

                <div className="relative flex items-center gap-2">
                  <input
                    id="video-link-input"
                    type="url"
                    required
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted) {
                        setTimeout(() => handleUrlChange(pasted), 20);
                      }
                    }}
                    placeholder="https://www.facebook.com/share/... ឬ https://youtube.com/watch?v=..."
                    className="flex-1 px-3.5 py-3 bg-slate-950/80 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 text-white placeholder-slate-500 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => extractVideoFromUrl(url)}
                    disabled={!url.trim() || isExtractingVideo}
                    className="px-3.5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
                    title={lang === 'km' ? 'ចុចដើម្បីទាញយកវីដេអូពី Facebook' : 'Extract video'}
                  >
                    {isExtractingVideo ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>{lang === 'km' ? 'ទាញយកវីដេអូ' : 'Extract'}</span>
                  </button>
                </div>

                {/* Quick Link Helper Presets */}
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
                  <span>{lang === 'km' ? 'តំណភ្ជាប់រហ័ស៖' : 'Quick links:'}</span>
                  <button
                    type="button"
                    onClick={handleApplyOfficialLink}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white transition-colors border border-white/10"
                  >
                    {lang === 'km' ? 'ទំព័រហ្វេសប៊ុក នាំដឹង' : 'Official Facebook Page'}
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySampleYoutube}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-red-300 hover:text-white transition-colors border border-white/10"
                  >
                    YouTube Video
                  </button>
                </div>
              </div>

              {/* Detected Live Preview Card with Test Play */}
              {url.trim() && (
                <div className="bg-slate-950/80 rounded-2xl border border-indigo-400/30 p-3.5 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      {isExtractingVideo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-amber-300 animate-pulse">
                            {extractStatusText ||
                              (lang === 'km'
                                ? 'កំពុងទាញយកវីដេអូពី Facebook...'
                                : 'Extracting Facebook video...')}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-bold text-emerald-300">
                            {extractStatusText ||
                              (detectedPlatform === 'facebook'
                                ? (lang === 'km'
                                    ? '✅ បានទាញយកវីដេអូ Facebook រួចរាល់'
                                    : 'Facebook video extracted')
                                : (lang === 'km'
                                    ? '✅ បានរកឃើញតំណភ្ជាប់វីដេអូ'
                                    : 'Video link detected'))}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPlayingPreview((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {isPlayingPreview
                          ? (lang === 'km' ? 'បិទផ្ទាំងចាក់សាកល្បង' : 'Close Preview')
                          : (lang === 'km' ? '🎬 ចាក់សាកល្បងលើកម្មវិធី (Test Play)' : 'Test Play in App')}
                      </span>
                    </button>
                  </div>

                  {/* Live Player Container */}
                  {isPlayingPreview ? (
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/15 shadow-inner">
                      {previewVideoUrl ? (
                        <video
                          src={previewVideoUrl}
                          controls
                          autoPlay
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : detectedPlatform === 'facebook' ? (
                        <iframe
                          src={getFacebookEmbedUrl(cleanFacebookUrl(url), true)}
                          title="Facebook Test Play"
                          className="w-full h-full border-0"
                          scrolling="no"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : detectedPlatform === 'youtube' ? (
                        <iframe
                          src={getEmbedUrl(url)}
                          title="YouTube Test Play"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={url}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsPlayingPreview(true)}
                      className="flex gap-3.5 items-center p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                      title={lang === 'km' ? 'ចុចដើម្បីចាក់សាកល្បងលើកម្មវិធី' : 'Click to test play'}
                    >
                      <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-800 border border-white/10 shrink-0">
                        <img
                          src={thumbnail || THUMBNAIL_PRESETS[0].url}
                          alt="Preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            {detectedPlatform}
                          </span>
                        </div>
                        <p className="font-semibold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                          {title || (lang === 'km' ? 'សូមបញ្ចូលចំណងជើងវីដេអូខាងក្រោម' : 'Enter video title below')}
                        </p>
                        <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5 font-mono">
                          {cleanFacebookUrl(url)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Title & Category (Quick via Link) */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm">
                  {lang === 'km' ? 'ចំណងជើងវីដេអូ (Title) *' : 'Video Title (Khmer) *'}
                </label>
                <input
                  id="link-video-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ឧទាហរណ៍៖ ការរកឃើញថ្មីអំពីលំហអាកាស និងបច្ចេកវិទ្យា AI"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm">
                    {lang === 'km' ? 'ប្រធានបទ (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm">
                    {lang === 'km' ? 'ស្ថានភាព (Status)' : 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VideoStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  >
                    <option value="published" className="bg-slate-900 text-white">
                      {lang === 'km' ? 'បានបង្ហោះ (Published)' : 'Published'}
                    </option>
                    <option value="scheduled" className="bg-slate-900 text-white">
                      {lang === 'km' ? 'គ្រោងបង្ហោះ (Scheduled)' : 'Scheduled'}
                    </option>
                    <option value="draft" className="bg-slate-900 text-white">
                      {lang === 'km' ? 'ព្រាងទុក (Draft)' : 'Draft'}
                    </option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm">
                  {lang === 'km' ? 'ការពិពណ៌នាខ្លឹមសារ (Description)' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="សង្ខេបខ្លឹមសារវីដេអូចំណេះដឹង..."
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500 text-xs sm:text-sm"
                />
              </div>

              {/* Multi-Photo Gallery & Slides Manager */}
              <ImageGalleryManager
                images={images}
                onChange={setImages}
                thumbnail={thumbnail}
                onSetThumbnail={setThumbnail}
                lang={lang}
              />
            </div>
          )}

          {/* ==================== TAB 2: MANUAL INPUT ==================== */}
          {(activeTab === 'manual' || editVideo) && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Title Khmer */}
              <div>
                <label className="block font-bold text-slate-200 mb-1 text-xs sm:text-sm">
                  {lang === 'km' ? 'ចំណងជើងមាតិកា (ភាសាខ្មែរ) *' : 'Content Title (Khmer) *'}
                </label>
                <input
                  id="manual-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="បញ្ចូលចំណងជើងវីដេអូចំណេះដឹង ឬអាល់ប៊ុមរូបភាពជាភាសាខ្មែរ..."
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500 text-sm"
                />
              </div>

              {/* Title English */}
              <div>
                <label className="block font-medium text-slate-400 mb-1 text-xs">
                  {lang === 'km' ? 'ចំណងជើងជាភាសាអង់គ្លេស (Title in English - Optional)' : 'English Title (Optional)'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Future of AI and Machine Learning"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              {/* Video URL or Source */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {lang === 'km'
                        ? images.length > 0
                          ? 'តំណភ្ជាប់វីដេអូ Facebook ឬ YouTube (ស្រេចចិត្ត)'
                          : 'តំណភ្ជាប់វីដេអូ Facebook ឬ YouTube *'
                        : images.length > 0
                        ? 'Video URL (Facebook / YouTube - Optional)'
                        : 'Video URL (Facebook / YouTube) *'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyOfficialLink}
                    className="text-xs text-indigo-400 hover:text-indigo-300 underline font-normal"
                  >
                    {lang === 'km' ? 'ប្រើ Link នាំដឹង' : 'Use Official Link'}
                  </button>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required={images.length === 0}
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted) {
                        setTimeout(() => handleUrlChange(pasted), 20);
                      }
                    }}
                    placeholder="https://www.facebook.com/... ឬ direct .mp4 link"
                    className="flex-1 px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500 text-xs sm:text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => extractVideoFromUrl(url)}
                    disabled={!url.trim() || isExtractingVideo}
                    className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md cursor-pointer"
                    title={lang === 'km' ? 'ទាញយកវីដេអូពី Facebook' : 'Extract video'}
                  >
                    {isExtractingVideo ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{lang === 'km' ? 'ទាញយក' : 'Extract'}</span>
                  </button>
                </div>
              </div>

              {/* Optional Direct MP4 / Video Upload */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'km' ? 'វីដេអូ MP4 សម្រាប់ចាក់ក្នុង App (ស្រេចចិត្ត - Optional)' : 'Direct Video Stream / Upload (Optional)'}</span>
                  </label>
                  {videoUploadName && (
                    <span className="text-[11px] text-emerald-400">
                      ✓ {videoUploadName}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={previewVideoUrl}
                    onChange={(e) => setPreviewVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="flex-1 px-3 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono"
                  />
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold shrink-0 transition-colors border border-white/10 flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'ផ្ទុកឡើង MP4' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              {/* Thumbnail & Slide Images Manager */}
              <ImageGalleryManager
                images={images}
                onChange={setImages}
                thumbnail={thumbnail}
                onSetThumbnail={setThumbnail}
                lang={lang}
              />

              {/* Category, Status, Duration, Publish Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm">
                    {lang === 'km' ? 'ប្រធានបទ (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as VideoCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm">
                    {lang === 'km' ? 'ស្ថានភាព (Status)' : 'Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VideoStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 text-sm"
                  >
                    <option value="published" className="bg-slate-900 text-white">
                      {lang === 'km' ? 'បានបង្ហោះ (Published)' : 'Published'}
                    </option>
                    <option value="scheduled" className="bg-slate-900 text-white">
                      {lang === 'km' ? 'គ្រោងបង្ហោះ (Scheduled)' : 'Scheduled'}
                    </option>
                    <option value="draft" className="bg-slate-900 text-white">
                      {lang === 'km' ? 'ព្រាងទុក (Draft)' : 'Draft'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'km' ? 'រយៈពេល (Duration)' : 'Duration (MM:SS)'}</span>
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="04:30"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'km' ? 'កាលបរិច្ឆេទ (Publish Date)' : 'Date'}</span>
                  </label>
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm">
                  {lang === 'km' ? 'ការពិពណ៌នាខ្លឹមសារ (Description)' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="សង្ខេបចំណុចសំខាន់ៗដែលវីដេអូនាំដឹងលើកឡើង..."
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 rounded-xl focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-500 text-xs sm:text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-slate-200 mb-1 text-xs sm:text-sm flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lang === 'km' ? 'ស្លាក (Tags) - បំបែកដោយសញ្ញាក្បៀស' : 'Tags (comma separated)'}</span>
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="នាំដឹង, បច្ចេកវិទ្យា, AI, វិទ្យាសាស្ត្រ"
                  className="w-full px-3.5 py-2 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500"
                />
              </div>

              {/* Metrics (Views, Likes, Shares) */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'km' ? 'ចំនួនមើល' : 'Views'}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={views}
                    onChange={(e) => setViews(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'km' ? 'ចូលចិត្ត' : 'Likes'}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={likes}
                    onChange={(e) => setLikes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lang === 'km' ? 'ចែករំលែក' : 'Shares'}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={shares}
                    onChange={(e) => setShares(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white/5 border border-white/15 rounded-xl text-white text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Creator Checklist */}
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-2">
                <p className="text-xs font-bold text-slate-200">
                  {lang === 'km' ? 'បញ្ជីត្រួតពិនិត្យការផលិត (Production Checklist):' : 'Production Checklist:'}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.script}
                      onChange={(e) => setChecklist({ ...checklist, script: e.target.checked })}
                      className="rounded text-indigo-500 bg-white/10 border-white/20"
                    />
                    <span className="text-slate-300">{lang === 'km' ? 'អត្ថបទនិយាយ (Script)' : 'Script'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.voiceover}
                      onChange={(e) => setChecklist({ ...checklist, voiceover: e.target.checked })}
                      className="rounded text-indigo-500 bg-white/10 border-white/20"
                    />
                    <span className="text-slate-300">{lang === 'km' ? 'ថតសំឡេង (Voiceover)' : 'Voiceover'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.thumbnailDone}
                      onChange={(e) => setChecklist({ ...checklist, thumbnailDone: e.target.checked })}
                      className="rounded text-indigo-500 bg-white/10 border-white/20"
                    />
                    <span className="text-slate-300">{lang === 'km' ? 'រូប Cover រួចរាល់' : 'Thumbnail'}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.subtitles}
                      onChange={(e) => setChecklist({ ...checklist, subtitles: e.target.checked })}
                      className="rounded text-indigo-500 bg-white/10 border-white/20"
                    />
                    <span className="text-slate-300">{lang === 'km' ? 'អក្សររត់ក្រោម' : 'Subtitles'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Modal Action Footer */}
          <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl pt-3.5 pb-1 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-colors"
            >
              {lang === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              id="video-form-submit-btn"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 border border-indigo-400/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>
                {editVideo
                  ? lang === 'km'
                    ? 'រក្សាទុកការផ្លាស់ប្តូរ'
                    : 'Save Changes'
                  : lang === 'km'
                    ? 'បន្ថែមវីដេអូទៅកាន់ Cloud'
                    : 'Save Video to Cloud'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
