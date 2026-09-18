import React from 'react';
import { Search, Grid, List, ArrowUpDown, Star, Layers, CheckCircle2, Clock, FileText } from 'lucide-react';
import { VideoCategory, VideoPlatform, ViewMode, SortOption } from '../types/video';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string; // 'all' or VideoCategory
  onSelectCategory: (cat: string) => void;
  selectedStatus: string; // 'all' | 'published' | 'scheduled' | 'draft' | 'favorites'
  onSelectStatus: (status: string) => void;
  selectedPlatform: string; // 'all' or VideoPlatform
  onSelectPlatform: (platform: string) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  categoryCounts: Record<string, number>;
  lang: 'km' | 'en';
}

const CATEGORIES: VideoCategory[] = [
  'បច្ចេកវិទ្យា',
  'វិទ្យាសាស្ត្រ',
  'ចំណេះដឹងទូទៅ',
  'ប្រវត្តិសាស្ត្រ',
  'សុខភាព & ខួរក្បាល',
  'គន្លឹះខ្លីៗ',
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  selectedPlatform,
  onSelectPlatform,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  categoryCounts,
  lang,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl mb-6 space-y-4">
      {/* Top row: Search, Sort, View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="video-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              lang === 'km'
                ? 'ស្វែងរកវីដេអូតាម ចំណងជើង, ស្លាក (Tags), ការពិពណ៌នា...'
                : 'Search videos by title, tags, description...'
            }
            className="w-full pl-10 pr-16 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all placeholder:text-slate-400 text-white backdrop-blur-md"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md transition-colors"
            >
              {lang === 'km' ? 'សម្អាត' : 'Clear'}
            </button>
          )}
        </div>

        {/* Sort & View toggles */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Platform Filter */}
          <select
            id="platform-filter-select"
            value={selectedPlatform}
            onChange={(e) => onSelectPlatform(e.target.value)}
            aria-label={lang === 'km' ? 'ជ្រើសរើសប្រភព' : 'Filter by platform'}
            className="text-xs sm:text-sm bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
          >
            <option value="all">{lang === 'km' ? 'ប្រភពទាំងអស់' : 'All Platforms'}</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
            <option value="direct">{lang === 'km' ? 'ឯកសារផ្ទាល់ (Direct)' : 'Direct Video'}</option>
          </select>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              id="sort-option-select"
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              aria-label={lang === 'km' ? 'តម្រៀបតាម' : 'Sort by'}
              className="pl-8 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900/90 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
            >
              <option value="newest">{lang === 'km' ? 'ថ្មីបំផុត' : 'Newest First'}</option>
              <option value="oldest">{lang === 'km' ? 'ចាស់ជាងគេ' : 'Oldest First'}</option>
              <option value="most_views">{lang === 'km' ? 'ចំនួនមើលច្រើនបំផុត' : 'Most Views'}</option>
              <option value="most_likes">{lang === 'km' ? 'ការចូលចិត្តច្រើន' : 'Most Likes'}</option>
              <option value="title">{lang === 'km' ? 'តាមតួអក្សរ A-Z' : 'Title A-Z'}</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              id="view-mode-grid-btn"
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white/20 text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'km' ? 'ទម្រង់ក្រឡា (Grid)' : 'Grid View'}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              id="view-mode-list-btn"
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white/20 text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={lang === 'km' ? 'ទម្រង់បញ្ជី (List)' : 'List View'}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle row: Status Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar border-t border-white/10 pt-3">
        <button
          onClick={() => onSelectStatus('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'វីដេអូទាំងអស់' : 'All Statuses'}</span>
        </button>

        <button
          onClick={() => onSelectStatus('published')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'published'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/30'
              : 'bg-white/5 text-emerald-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'បានបង្ហោះរួច' : 'Published'}</span>
        </button>

        <button
          onClick={() => onSelectStatus('scheduled')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'scheduled'
              ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 border border-indigo-400/30'
              : 'bg-white/5 text-indigo-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'គ្រោងបង្ហោះ' : 'Scheduled'}</span>
        </button>

        <button
          onClick={() => onSelectStatus('draft')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'draft'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400/30'
              : 'bg-white/5 text-amber-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'ព្រាងទុក' : 'Drafts'}</span>
        </button>

        <button
          onClick={() => onSelectStatus('favorites')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'favorites'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30 border border-amber-300/40'
              : 'bg-white/5 text-amber-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{lang === 'km' ? 'ចូលចិត្ត' : 'Favorites'}</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
          }`}
        >
          {lang === 'km' ? 'ប្រធានបទទាំងអស់' : 'All Topics'} (
          {categoryCounts['all'] || 0})
        </button>
        {CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
};
