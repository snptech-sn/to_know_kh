import React from 'react';
import {
  Play,
  Star,
  Eye,
  Info,
  ThumbsUp,
  Share2,
  ExternalLink,
  Edit3,
  Trash2,
  Copy,
  Check,
  CheckSquare,
  Square,
  Images,
} from 'lucide-react';
import { VideoItem, VideoStatus, ViewMode } from '../types/video';
import { formatCompactNumber, toKhmerNumerals } from '../utils/videoHelper';

interface VideoCardProps {
  video: VideoItem;
  viewMode: ViewMode;
  onPlay: (video: VideoItem) => void;
  onEdit: (video: VideoItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  lang: 'km' | 'en';
  isAdminMode?: boolean;
  batchSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onQuickStatusChange?: (id: string, nextStatus: VideoStatus) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  viewMode,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  lang,
  isAdminMode = true,
  batchSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onQuickStatusChange,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdminMode || !onQuickStatusChange) return;
    const nextStatus: Record<VideoStatus, VideoStatus> = {
      published: 'scheduled',
      scheduled: 'draft',
      draft: 'published',
    };
    onQuickStatusChange(video.id, nextStatus[video.status]);
  };

  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  const statusConfig = {
    published: {
      km: 'បានបង្ហោះ',
      en: 'Published',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      dot: 'bg-emerald-400',
    },
    scheduled: {
      km: 'គ្រោងបង្ហោះ',
      en: 'Scheduled',
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
      dot: 'bg-indigo-400',
    },
    draft: {
      km: 'ព្រាងទុក',
      en: 'Draft',
      color: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      dot: 'bg-amber-400',
    },
  }[video.status];

  const platformBadge = {
    facebook: { label: 'Facebook', bg: 'bg-blue-600/80 text-white border border-blue-400/30 backdrop-blur-md' },
    youtube: { label: 'YouTube', bg: 'bg-red-600/80 text-white border border-red-400/30 backdrop-blur-md' },
    direct: { label: 'Direct MP4', bg: 'bg-emerald-600/80 text-white border border-emerald-400/30 backdrop-blur-md' },
    other: { label: 'Web Video', bg: 'bg-slate-700/80 text-white border border-slate-500/30 backdrop-blur-md' },
  }[video.platform];

  // List View Mode
  if (viewMode === 'list') {
    return (
      <div
        id={`video-row-${video.id}`}
        className={`bg-white/5 backdrop-blur-xl rounded-2xl border transition-all p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between group ${
          isSelected
            ? 'border-indigo-500 bg-indigo-950/30 shadow-indigo-500/10 shadow-lg'
            : 'border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
        }`}
      >
        {/* Left Thumbnail & Info */}
        <div className="flex items-start gap-3 sm:gap-3.5 flex-1 min-w-0 w-full sm:w-auto">
          {/* Batch checkbox */}
          {batchSelectMode && (
            <button
              type="button"
              onClick={() => onToggleSelect?.(video.id)}
              className="mt-1 p-1 text-slate-300 hover:text-white shrink-0"
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-indigo-400" />
              ) : (
                <Square className="w-5 h-5 text-slate-500" />
              )}
            </button>
          )}

          <div
            onClick={() => onPlay(video)}
            className="relative w-28 sm:w-44 aspect-video rounded-xl overflow-hidden bg-slate-900 cursor-pointer shrink-0 group/thumb ring-1 ring-white/10"
          >
            <img
              src={video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}
              alt={video.title}
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/25 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 text-slate-950 flex items-center justify-center shadow-lg transform scale-90 group-hover/thumb:scale-100 transition-transform">
                {video.mediaType === 'gallery' ? (
                  <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                ) : (
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                )}
              </div>
            </div>
            {video.images && video.images.length > 0 && (
              <span className="absolute bottom-1 left-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-950/85 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                <Images className="w-2.5 h-2.5 text-amber-400" />
                <span>{num(video.images.length)}</span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${platformBadge.bg}`}>
                {platformBadge.label}
              </span>
              <span className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10 backdrop-blur-md">
                {video.category}
              </span>

              {/* Status pill (clickable by admin) */}
              <button
                type="button"
                onClick={handleCycleStatus}
                disabled={!isAdminMode}
                className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  statusConfig.color
                } ${isAdminMode ? 'cursor-pointer hover:opacity-80' : ''}`}
                title={isAdminMode ? 'ចុចដើម្បីប្តូរស្ថានភាព' : undefined}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                <span>{lang === 'km' ? statusConfig.km : statusConfig.en}</span>
              </button>
            </div>

            <h3
              onClick={() => onPlay(video)}
              className="text-xs sm:text-sm font-bold text-white line-clamp-1 hover:text-indigo-300 cursor-pointer"
            >
              {video.title}
            </h3>

            <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1 hidden sm:block mt-0.5">
              {video.description}
            </p>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-400" />
                {num(formatCompactNumber(video.views))}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3 text-slate-400" />
                {num(formatCompactNumber(video.likes))}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                {num(video.publishDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => onToggleFavorite(video.id)}
            className={`p-2 rounded-xl transition-colors ${
              video.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="ចូលចិត្ត"
          >
            <Star className={`w-4 h-4 ${video.isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onPlay(video)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
            title={lang === 'km' ? 'មើលព័ត៌មានលម្អិតបន្ថែម' : 'View full details'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? 'ព័ត៌មានលម្អិត' : 'Details'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="ចម្លងតំណភ្ជាប់"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/10 rounded-xl transition-colors"
            title="ប្រភពដើម"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {isAdminMode && (
            <>
              <button
                type="button"
                onClick={() => onEdit(video)}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-white/10 rounded-xl transition-colors"
                title="កែសម្រួលវីដេអូ"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(video.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/15 rounded-xl transition-colors"
                title="លុបវីដេអូ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Grid View Card
  return (
    <div
      id={`video-card-${video.id}`}
      className={`bg-white/5 backdrop-blur-xl rounded-2xl border shadow-xl transition-all flex flex-col overflow-hidden group ${
        isSelected
          ? 'border-indigo-500 bg-indigo-950/30 shadow-indigo-500/15 shadow-xl'
          : 'border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
      }`}
    >
      {/* Thumbnail Area */}
      <div
        onClick={() => {
          if (batchSelectMode) {
            onToggleSelect?.(video.id);
          } else {
            onPlay(video);
          }
        }}
        className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden ring-1 ring-white/10"
      >
        <img
          src={video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Hover details button overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-slate-950 font-bold text-xs shadow-xl transform scale-90 group-hover:scale-100 transition-all">
            {video.mediaType === 'gallery' ? (
              <Images className="w-4 h-4 text-indigo-600" />
            ) : (
              <Eye className="w-4 h-4 text-indigo-600" />
            )}
            <span>{lang === 'km' ? 'ព័ត៌មានលម្អិត' : 'View Details'}</span>
          </div>
        </div>

        {/* Batch selection checkbox indicator */}
        {batchSelectMode && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(video.id);
            }}
            className="absolute top-2.5 left-2.5 z-10 p-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white transition-all shadow-md"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-300" />
            )}
          </button>
        )}

        {/* Platform & Status Badges */}
        <div className={`absolute ${batchSelectMode ? 'top-2.5 left-10' : 'top-2.5 left-2.5'} flex items-center gap-1.5`}>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm ${platformBadge.bg}`}>
            {platformBadge.label}
          </span>
          <button
            type="button"
            onClick={handleCycleStatus}
            disabled={!isAdminMode}
            className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full border shadow-xs inline-flex items-center gap-1 bg-slate-950/80 backdrop-blur-md ${
              statusConfig.color
            } ${isAdminMode ? 'cursor-pointer hover:opacity-90' : ''}`}
            title={isAdminMode ? 'ចុចដើម្បីប្តូរស្ថានភាព' : undefined}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            <span>{lang === 'km' ? statusConfig.km : statusConfig.en}</span>
          </button>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(video.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all border ${
            video.isFavorite
              ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
              : 'bg-black/50 text-white/90 hover:bg-black/70 hover:text-white border-white/20'
          }`}
          title={video.isFavorite ? 'ដកចេញពីចូលចិត្ត' : 'ដាក់ជាចូលចិត្ត'}
        >
          <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${video.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Gallery count badge */}
        {video.images && video.images.length > 0 && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-950/85 text-amber-300 border border-amber-400/30 backdrop-blur-md shadow-md">
            <Images className="w-3.5 h-3.5 text-amber-400" />
            <span>{num(video.images.length)} {lang === 'km' ? 'រូប' : 'photos'}</span>
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Category & Date */}
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
          <span className="font-semibold text-indigo-400 hover:text-indigo-300 truncate">
            {video.category}
          </span>
          <span className="text-slate-400 font-mono text-[11px] shrink-0">
            {num(video.publishDate)}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onPlay(video)}
          className="text-xs sm:text-sm font-bold text-white line-clamp-2 hover:text-indigo-300 cursor-pointer leading-snug mb-1"
          title={video.title}
        >
          {video.title}
        </h3>

        {/* Description */}
        <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 mb-2.5 leading-relaxed">
          {video.description}
        </p>

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {video.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-1.5 py-0.5 rounded-md transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer & Bottom Action row */}
        <div className="mt-auto pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          {/* Stats */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 font-medium text-slate-300 text-[11px]">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {num(formatCompactNumber(video.views))}
            </span>
            <span className="flex items-center gap-1 font-medium text-slate-300 text-[11px]">
              <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
              {num(formatCompactNumber(video.likes))}
            </span>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => onPlay(video)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
              title={lang === 'km' ? 'មើលព័ត៌មានលម្អិតបន្ថែម' : 'View content details'}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'km' ? 'ព័ត៌មានលម្អិត' : 'Details'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="ចម្លងតំណភ្ជាប់ (Copy link)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-colors"
              title="បើកមើលលើ Facebook / ប្រភពដើម"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {isAdminMode && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(video)}
                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-colors"
                  title="កែសម្រួលវីដេអូ"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(video.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="លុបវីដេអូ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
