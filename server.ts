import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&#([0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Video Extraction Endpoint (Facebook, YouTube, Direct)
  app.post('/api/extract-video', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
      }
      const cleanUrl = url.trim();

      // 1. YouTube
      const ytMatch = cleanUrl.match(
        /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
      );
      if (ytMatch) {
        const ytId = ytMatch[1];
        const isShort = cleanUrl.includes('shorts');
        return res.json({
          platform: 'youtube',
          canonicalUrl: `https://www.youtube.com/watch?v=${ytId}`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`,
          thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
          videoId: ytId,
          title: isShort ? 'វីដេអូខ្លី YouTube Shorts' : 'វីដេអូចំណេះដឹង (YouTube)',
          description: 'វីដេអូចែករំលែកចំណេះដឹងពី YouTube',
          isReel: isShort,
          success: true,
        });
      }

      // 2. Direct Video (mp4, webm)
      if (
        cleanUrl.endsWith('.mp4') ||
        cleanUrl.endsWith('.webm') ||
        cleanUrl.includes('.mp4?') ||
        cleanUrl.includes('.webm?')
      ) {
        return res.json({
          platform: 'direct',
          canonicalUrl: cleanUrl,
          embedUrl: cleanUrl,
          directVideoUrl: cleanUrl,
          thumbnail:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          title: 'វីដេអូផ្ទាល់ (Direct Video)',
          description: 'វីដេអូចាក់លេងដោយផ្ទាល់ក្នុងកម្មវិធី',
          isReel: false,
          success: true,
        });
      }

      // 3. Facebook Video Extraction
      let finalUrl = cleanUrl;
      let html = '';

      try {
        const response = await fetch(cleanUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'km,en-US;q=0.9,en;q=0.8',
          },
          redirect: 'follow',
        });
        finalUrl = response.url;
        html = await response.text();
      } catch (fetchErr: any) {
        console.warn('Direct fetch warning:', fetchErr.message);
      }

      // Extract Facebook Video ID
      let videoId = '';
      const watchMatch = finalUrl.match(/[?&]v=(\d+)/) || cleanUrl.match(/[?&]v=(\d+)/);
      const videosMatch = finalUrl.match(/\/videos\/(\d+)/) || cleanUrl.match(/\/videos\/(\d+)/);
      const reelMatch = finalUrl.match(/\/reel(?:s)?\/(\d+)/) || cleanUrl.match(/\/reel(?:s)?\/(\d+)/);
      const numMatch = finalUrl.match(/\/(\d{10,22})/);

      if (watchMatch) videoId = watchMatch[1];
      else if (videosMatch) videoId = videosMatch[1];
      else if (reelMatch) videoId = reelMatch[1];
      else if (numMatch) videoId = numMatch[1];

      const isReel =
        finalUrl.includes('/reel') ||
        cleanUrl.includes('/reel') ||
        cleanUrl.includes('/share/r');

      // Canonical URL for Facebook Video Player plugin
      let canonicalUrl = finalUrl;
      if (videoId) {
        canonicalUrl = isReel
          ? `https://www.facebook.com/reel/${videoId}`
          : `https://www.facebook.com/watch/?v=${videoId}`;
      }

      // Extract OpenGraph tags
      let title = '';
      let description = '';
      let thumbnail = '';
      let directVideoUrl = '';

      if (html) {
        const ogTitleMatch = html.match(
          /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i,
        );
        const ogDescMatch = html.match(
          /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i,
        );
        const ogImgMatch = html.match(
          /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
        );
        const ogVidMatch = html.match(
          /<meta\s+property=["']og:video(?::secure_url)?["']\s+content=["']([^"']+)["']/i,
        );

        if (ogTitleMatch) {
          let t = decodeHtmlEntities(ogTitleMatch[1]);
          t = t.replace(/\s*\|\s*Facebook\s*$/i, '');
          if (t.includes('|')) {
            const parts = t.split('|').map((p) => p.trim()).filter(Boolean);
            // If the first part is view counts/reactions, take the last part
            if (parts.length > 1 && (parts[0].includes('views') || parts[0].includes('មើល') || parts[0].includes('reactions') || parts[0].includes('ប្រតិកម្ម'))) {
              t = parts.slice(1).join(' - ');
            } else if (parts.length > 0) {
              t = parts[0];
            }
          }
          if (t.trim()) title = t.trim();
        }

        if (ogDescMatch && ogDescMatch[1].trim()) {
          description = decodeHtmlEntities(ogDescMatch[1].trim());
        }

        if (ogImgMatch && ogImgMatch[1].trim()) {
          thumbnail = ogImgMatch[1].trim().replace(/&amp;/g, '&');
        }

        if (ogVidMatch && ogVidMatch[1].trim()) {
          directVideoUrl = ogVidMatch[1].trim().replace(/&amp;/g, '&');
        } else {
          // Look for direct stream links inside script blocks
          const unescaped = html.split('\\/').join('/');
          const playMatch = unescaped.match(
            /"(browser_native_hd_url|browser_native_sd_url|playable_url|playable_url_quality_hd)":"(https:[^"\s]+)"/,
          );
          if (playMatch && playMatch[2]) {
            directVideoUrl = playMatch[2].replace(/\\u0025/g, '%').replace(/&amp;/g, '&');
          }
        }
      }

      // Fallbacks
      if (!title) {
        title = isReel
          ? 'វីដេអូខ្លីចំណេះដឹង (Reels) - នាំដឹង'
          : 'វីដេអូចំណេះដឹងពីទំព័រហ្វេសប៊ុក នាំដឹង - To Know';
      }
      if (!description) {
        description =
          'ខ្លឹមសារវីដេអូចែករំលែកចំណេះដឹងទូទៅ វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យាពីទំព័រហ្វេសប៊ុក នាំដឹង - To Know។';
      }
      if (!thumbnail) {
        thumbnail =
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
      }

      // Build official Facebook Embed plugin URL
      const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        canonicalUrl,
      )}&show_text=false&t=0&autoplay=true`;

      return res.json({
        platform: 'facebook',
        canonicalUrl,
        embedUrl,
        directVideoUrl: directVideoUrl || undefined,
        thumbnail,
        title,
        description,
        videoId: videoId || undefined,
        isReel,
        success: true,
      });
    } catch (err: any) {
      console.error('Error in /api/extract-video:', err);
      return res
        .status(500)
        .json({ error: err.message || 'Failed to extract video' });
    }
  });

  // Video Proxy Endpoint (To bypass CORS/hotlinking restrictions for direct streams)
  app.get('/api/proxy-video', async (req, res) => {
    try {
      const videoUrl = req.query.url as string;
      if (!videoUrl) return res.status(400).send('URL is required');

      const range = req.headers.range;
      const headers: Record<string, string> = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      };
      if (range) headers['Range'] = range;

      const response = await fetch(videoUrl, { headers });
      res.status(response.status);

      for (const [k, v] of response.headers.entries()) {
        if (
          [
            'content-type',
            'content-length',
            'content-range',
            'accept-ranges',
          ].includes(k.toLowerCase())
        ) {
          res.setHeader(k, v);
        }
      }
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (!response.body) {
        return res.end();
      }

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      res.end();
    } catch (err: any) {
      console.error('Proxy video error:', err);
      if (!res.headersSent) res.status(500).send(err.message);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
