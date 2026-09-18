import React from 'react';
import { FileText, Eye, ThumbsUp, Calendar, Layers } from 'lucide-react';
import { VideoItem } from '../types/video';
import { formatCompactNumber, toKhmerNumerals } from '../utils/videoHelper';

interface StatsBannerProps {
  videos: VideoItem[];
  lang: 'km' | 'en';
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ videos, lang }) => {
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const scheduledCount = videos.filter((v) => v.status === 'scheduled').length;
  const draftCount = videos.filter((v) => v.status === 'draft').length;
  const publishedCount = videos.filter((v) => v.status === 'published').length;

  const num = (n: number | string) => (lang === 'km' ? toKhmerNumerals(n) : String(n));

  return (
    <div id="stats-banner-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Articles / Content */}
      <div
        id="stat-card-total-articles"
        className="bg-white/5 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between hover:bg-white/[0.08] hover:border-white/20 transition-all"
      >
        <div>
          <p className="text-xs font-medium text-slate-400">
            {lang === 'km' ? 'អត្ថបទសរុប' : 'Total Articles'}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {num(totalVideos)}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'km' ? 'អត្ថបទ' : 'articles'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      {/* Total Views */}
      <div className="bg-white/5 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between hover:bg-white/[0.08] hover:border-white/20 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {lang === 'km' ? 'ចំនួនអ្នកទស្សនាសរុប' : 'Total Views'}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {num(formatCompactNumber(totalViews))}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'km' ? 'ដង' : 'views'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Eye className="w-5 h-5" />
        </div>
      </div>

      {/* Total Likes */}
      <div className="bg-white/5 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between hover:bg-white/[0.08] hover:border-white/20 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {lang === 'km' ? 'ការចូលចិត្តសរុប' : 'Total Likes'}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {num(formatCompactNumber(totalLikes))}
            </span>
            <span className="text-xs text-slate-400">
              {lang === 'km' ? 'Likes' : 'likes'}
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <ThumbsUp className="w-5 h-5" />
        </div>
      </div>

      {/* Publishing Status */}
      <div className="bg-white/5 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-lg flex items-center justify-between hover:bg-white/[0.08] hover:border-white/20 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {lang === 'km' ? 'ស្ថានភាពផ្សព្វផ្សាយ' : 'Status Overview'}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs font-medium flex-wrap">
            <span className="inline-flex items-center gap-1 text-emerald-300 bg-emerald-500/15 border border-emerald-400/20 px-1.5 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {num(publishedCount)} {lang === 'km' ? 'បានបង្ហោះ' : 'Pub'}
            </span>
            {scheduledCount > 0 && (
              <span className="inline-flex items-center gap-1 text-indigo-300 bg-indigo-500/15 border border-indigo-400/20 px-1.5 py-0.5 rounded-md">
                <Calendar className="w-3 h-3" />
                {num(scheduledCount)}
              </span>
            )}
            {draftCount > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/15 border border-amber-400/20 px-1.5 py-0.5 rounded-md">
                <Layers className="w-3 h-3" />
                {num(draftCount)}
              </span>
            )}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
          <Layers className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
