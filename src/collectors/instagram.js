import axios from 'axios';

const RAPIDAPI_HOST = 'instagram-scraper-api2.p.rapidapi.com';

/**
 * Busca contenido popular de Instagram usando RapidAPI.
 * Requiere suscripción (tiene plan gratuito) en:
 * https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2
 */
export async function fetchInstagramTrending(topic, maxResults = 5) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn('[Instagram] RapidAPI key no configurada. Omitiendo Instagram.');
    return [];
  }

  const results = [];

  for (const keyword of topic.keywords) {
    try {
      // Buscar hashtags relacionados con el keyword
      const hashtag = keyword.replace(/\s+/g, '').toLowerCase();

      const response = await axios.get(
        `https://${RAPIDAPI_HOST}/v1/hashtag`,
        {
          params: { hashtag },
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': RAPIDAPI_HOST,
          },
          timeout: 15000,
        },
      );

      const posts = response.data?.data?.items || response.data?.items || [];

      for (const post of posts.slice(0, maxResults)) {
        results.push({
          platform: 'Instagram',
          title: extractCaption(post),
          description: '',
          url: post.code
            ? `https://www.instagram.com/p/${post.code}/`
            : `https://www.instagram.com/`,
          thumbnail: post.thumbnail_url || post.display_url || '',
          channel: post.user?.username || 'Unknown',
          publishedAt: post.taken_at
            ? new Date(post.taken_at * 1000).toISOString()
            : '',
          views: post.video_view_count || post.play_count || 0,
          likes: post.like_count || 0,
          keyword,
        });
      }
    } catch (error) {
      console.error(`[Instagram] Error buscando "${keyword}":`, error.message);
    }
  }

  const unique = deduplicateByUrl(results);
  return unique.sort((a, b) => b.likes - a.likes).slice(0, maxResults * 2);
}

function extractCaption(post) {
  const caption =
    post.caption?.text || post.edge_media_to_caption?.edges?.[0]?.node?.text || '';
  return caption.substring(0, 120) || 'Sin título';
}

function deduplicateByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
