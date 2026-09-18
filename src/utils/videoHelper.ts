import { VideoCategory, VideoPlatform } from '../types/video';

/**
 * Detect video platform from URL
 */
export function detectPlatform(url: string): VideoPlatform {
  if (!url) return 'other';
  const cleanUrl = url.toLowerCase();
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch') || cleanUrl.includes('fb.com')) {
    return 'facebook';
  }
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.webm') || cleanUrl.endsWith('.m3u8')) {
    return 'direct';
  }
  return 'other';
}

/**
 * Extract YouTube ID if present
 */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match && match[1] ? match[1] : null;
}

/**
 * Get YouTube high quality thumbnail
 */
export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Clean Facebook URLs by removing mobile prefixes and tracking parameters
 */
export function cleanFacebookUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (
      parsed.hostname === 'm.facebook.com' ||
      parsed.hostname === 'mobile.facebook.com' ||
      parsed.hostname === 'web.facebook.com' ||
      parsed.hostname === 'l.facebook.com'
    ) {
      parsed.hostname = 'www.facebook.com';
    }
    // Strip common tracking and referrer params that prevent embeds
    const trackingParams = [
      'mibextid',
      'rdid',
      'ref',
      'sfnsn',
      'fbclid',
      '__cft__',
      '__tn__',
      'app',
      'source',
      'fs',
      'comment_id',
    ];
    trackingParams.forEach((p) => parsed.searchParams.delete(p));

    return parsed.toString();
  } catch {
    return trimmed;
  }
}

/**
 * Generate Facebook Video Embed plugin URL with proper encoding and autoplay
 */
export function getFacebookEmbedUrl(url: string, autoplay = true): string {
  const clean = cleanFacebookUrl(url);
  const encoded = encodeURIComponent(clean);
  return `https://www.facebook.com/plugins/video.php?height=476&href=${encoded}&show_text=false&width=476&t=0${autoplay ? '&autoplay=true' : ''}`;
}

/**
 * Extract useful info from a Facebook video URL
 */
export function extractFacebookVideoInfo(url: string) {
  const clean = cleanFacebookUrl(url);
  const embedUrl = getFacebookEmbedUrl(clean, true);

  // Check if it is a Reel
  const isReel = clean.includes('/reel/') || clean.includes('/reels/');
  // Check if it is a Watch URL
  const isWatch = clean.includes('/watch') || clean.includes('fb.watch');

  return {
    cleanUrl: clean,
    embedUrl,
    isReel,
    isWatch,
    suggestedCategory: isReel ? ('គន្លឹះខ្លីៗ' as VideoCategory) : undefined,
  };
}

/**
 * Generate embed URL if applicable
 */
export function getEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // YouTube standard or short
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
  }

  // Facebook Video Embed plugin URL
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch') || trimmed.includes('fb.com')) {
    return getFacebookEmbedUrl(trimmed, true);
  }

  // Direct video
  if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm')) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Suggest category based on keywords
 */
export function suggestCategoryFromKeywords(text: string): VideoCategory {
  const lower = text.toLowerCase();
  if (lower.includes('ai') || lower.includes('robot') || lower.includes('បច្ចេកវិទ្យា') || lower.includes('computer') || lower.includes('ទូរស័ព្ទ')) {
    return 'បច្ចេកវិទ្យា';
  }
  if (lower.includes('លំហ') || lower.includes('វិទ្យាសាស្ត្រ') || lower.includes('science') || lower.includes('ភព') || lower.includes('ផែនដី')) {
    return 'វិទ្យាសាស្ត្រ';
  }
  if (lower.includes('ប្រវត្តិ') || lower.includes('history') || lower.includes('បុរាណ') || lower.includes('សង្គ្រាម')) {
    return 'ប្រវត្តិសាស្ត្រ';
  }
  if (lower.includes('សុខភាព') || lower.includes('ខួរក្បាល') || lower.includes('ចិត្ត') || lower.includes('health')) {
    return 'សុខភាព & ខួរក្បាល';
  }
  if (lower.includes('reels') || lower.includes('shorts') || lower.includes('គន្លឹះ') || lower.includes('tips')) {
    return 'គន្លឹះខ្លីៗ';
  }
  return 'ចំណេះដឹងទូទៅ';
}

/**
 * Format view numbers nicely (e.g. 12.5K, 1.2M)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

/**
 * Convert numbers to Khmer numerals if needed
 */
export function toKhmerNumerals(val: string | number): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(val).replace(/[0-9]/g, (w) => khmerDigits[+w]);
}

/**
 * Fallback high-definition stream for immediate in-app playback
 */
export function getFallbackVideoForCategory(category?: VideoCategory): string {
  switch (category) {
    case 'បច្ចេកវិទ្យា':
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    case 'វិទ្យាសាស្ត្រ':
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4';
    case 'សុខភាព & ខួរក្បាល':
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4';
    case 'ប្រវត្តិសាស្ត្រ':
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';
    case 'គន្លឹះខ្លីៗ':
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4';
    case 'ចំណេះដឹងទូទៅ':
    default:
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4';
  }
}
