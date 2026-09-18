export type VideoPlatform = 'facebook' | 'youtube' | 'direct' | 'other';

export type VideoStatus = 'published' | 'draft' | 'scheduled';

export type MediaType = 'video' | 'gallery' | 'mixed';

export type VideoCategory = 
  | 'បច្ចេកវិទ្យា' // Technology
  | 'វិទ្យាសាស្ត្រ' // Science
  | 'ចំណេះដឹងទូទៅ' // General Knowledge
  | 'ប្រវត្តិសាស្ត្រ' // History
  | 'សុខភាព & ខួរក្បាល' // Health & Mind
  | 'គន្លឹះខ្លីៗ'; // Short Tips & Reels

export interface VideoItem {
  id: string;
  title: string;
  titleEn?: string;
  url: string;
  embedUrl?: string;
  previewVideoUrl?: string;
  platform: VideoPlatform;
  mediaType?: MediaType;
  images?: string[]; // Multiple attached photos (uploaded directly or via URLs)
  category: VideoCategory;
  description: string;
  thumbnail: string;
  duration: string; // e.g. "04:30"
  views: number;
  likes: number;
  shares: number;
  publishDate: string; // YYYY-MM-DD
  status: VideoStatus;
  tags: string[];
  isFavorite: boolean;
  notes?: string;
  creatorChecklist?: {
    script: boolean;
    voiceover: boolean;
    thumbnailDone: boolean;
    subtitles: boolean;
  };
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'most_views' | 'most_likes' | 'title';
