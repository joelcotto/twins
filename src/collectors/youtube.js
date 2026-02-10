import { google } from 'googleapis';

const youtube = google.youtube('v3');

/**
 * Busca los videos más populares de YouTube para un tema dado.
 * Usa la YouTube Data API v3 (oficial y gratuita con límite de 10,000 unidades/día).
 */
export async function fetchYouTubeTrending(topic, maxResults = 5) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.warn('[YouTube] API key no configurada. Omitiendo YouTube.');
    return [];
  }

  const results = [];

  for (const keyword of topic.keywords) {
    try {
      const response = await youtube.search.list({
        key: apiKey,
        part: 'snippet',
        q: keyword,
        type: 'video',
        order: 'viewCount',
        publishedAfter: getLastWeekDate(),
        maxResults,
        relevanceLanguage: 'es',
      });

      const videos = response.data.items || [];

      // Obtener estadísticas (views, likes) de los videos encontrados
      const videoIds = videos.map((v) => v.id.videoId).join(',');
      let statsMap = {};

      if (videoIds) {
        const statsResponse = await youtube.videos.list({
          key: apiKey,
          part: 'statistics',
          id: videoIds,
        });

        for (const item of statsResponse.data.items || []) {
          statsMap[item.id] = item.statistics;
        }
      }

      for (const video of videos) {
        const videoId = video.id.videoId;
        const stats = statsMap[videoId] || {};

        results.push({
          platform: 'YouTube',
          title: video.snippet.title,
          description: video.snippet.description?.substring(0, 150) || '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: video.snippet.thumbnails?.medium?.url || '',
          channel: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          views: parseInt(stats.viewCount || '0', 10),
          likes: parseInt(stats.likeCount || '0', 10),
          keyword,
        });
      }
    } catch (error) {
      console.error(`[YouTube] Error buscando "${keyword}":`, error.message);
    }
  }

  // Eliminar duplicados por URL y ordenar por views
  const unique = deduplicateByUrl(results);
  return unique.sort((a, b) => b.views - a.views).slice(0, maxResults * 2);
}

function getLastWeekDate() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString();
}

function deduplicateByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
