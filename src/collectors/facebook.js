import axios from 'axios';

const RAPIDAPI_HOST = 'facebook-scraper3.p.rapidapi.com';

/**
 * Busca contenido popular de Facebook usando RapidAPI.
 * Requiere suscripción (tiene plan gratuito) en:
 * https://rapidapi.com/developer-jeremie/api/facebook-scraper3
 */
export async function fetchFacebookTrending(topic, maxResults = 5) {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.warn('[Facebook] RapidAPI key no configurada. Omitiendo Facebook.');
    return [];
  }

  const results = [];

  for (const keyword of topic.keywords) {
    try {
      const response = await axios.get(
        `https://${RAPIDAPI_HOST}/search/posts`,
        {
          params: {
            query: keyword,
            limit: maxResults.toString(),
          },
          headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': RAPIDAPI_HOST,
          },
          timeout: 15000,
        },
      );

      const posts = response.data?.results || response.data?.data || [];

      for (const post of posts.slice(0, maxResults)) {
        results.push({
          platform: 'Facebook',
          title: extractText(post),
          description: '',
          url: post.url || post.post_url || 'https://www.facebook.com/',
          thumbnail: post.image || post.full_picture || '',
          channel: post.page_name || post.user_name || post.author || 'Unknown',
          publishedAt: post.created_time || post.timestamp || '',
          views: post.views || 0,
          likes: post.reactions_count || post.likes || post.like_count || 0,
          keyword,
        });
      }
    } catch (error) {
      console.error(`[Facebook] Error buscando "${keyword}":`, error.message);
    }
  }

  const unique = deduplicateByUrl(results);
  return unique.sort((a, b) => b.likes - a.likes).slice(0, maxResults * 2);
}

function extractText(post) {
  const text = post.text || post.message || post.description || '';
  return text.substring(0, 120) || 'Sin título';
}

function deduplicateByUrl(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}
