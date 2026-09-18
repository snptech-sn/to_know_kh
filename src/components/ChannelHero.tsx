import React from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { OFFICIAL_PAGE_INFO } from '../data/initialVideos';
import { ChannelLogo } from './ChannelLogo';

interface ChannelHeroProps {
  onQuickCategory: (category: string) => void;
  lang: 'km' | 'en';
  followers?: string;
  likes?: string;
  isAdminMode?: boolean;
  onEditStats?: () => void;
}

export const ChannelHero: React.FC<ChannelHeroProps> = ({
  onQuickCategory,
  lang,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 text-white p-6 sm:p-8 mb-6 shadow-2xl group">
      {/* Background visual accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Channel Identity */}
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <ChannelLogo size="lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center ring-2 ring-slate-950 shadow-md">
              <CheckCircle className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {OFFICIAL_PAGE_INFO.nameKm}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                Phnom Penh, Cambodia
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {OFFICIAL_PAGE_INFO.taglineKm}
            </p>
          </div>
        </div>

        {/* Action Button & Channel Navigation */}
        <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
          <a
            id="hero-open-facebook-btn"
            href={OFFICIAL_PAGE_INFO.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs sm:text-sm shadow-xl transition-all hover:translate-y-[-1px]"
          >
            <span>{lang === 'km' ? 'ចូលមើលទំព័រ Facebook ផ្លូវការ' : 'Visit Official Facebook'}</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
            <span className="text-slate-400 text-[11px]">{lang === 'km' ? 'ជ្រើសរើសរហ័ស៖' : 'Quick:'}</span>
            <button
              onClick={() => onQuickCategory('បច្ចេកវិទ្យា')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[11px] text-slate-200 border border-white/10 backdrop-blur-md"
            >
              #បច្ចេកវិទ្យា
            </button>
            <button
              onClick={() => onQuickCategory('វិទ្យាសាស្ត្រ')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[11px] text-slate-200 border border-white/10 backdrop-blur-md"
            >
              #វិទ្យាសាស្ត្រ
            </button>
            <button
              onClick={() => onQuickCategory('គន្លឹះខ្លីៗ')}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[11px] text-slate-200 border border-white/10 backdrop-blur-md"
            >
              #Reels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
