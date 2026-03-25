// Cloudflare Worker エントリーポイント
// - /api/gnews → Google News RSS プロキシ
// - それ以外  → 静的アセット（React SPA）

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/gnews') {
      return proxyGoogleNews(url.searchParams);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function proxyGoogleNews(params: URLSearchParams): Promise<Response> {
  const targetUrl = new URL('https://news.google.com/rss/search');
  params.forEach((value, key) => targetUrl.searchParams.set(key, value));

  const response = await fetch(targetUrl.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
  });

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: {
      'Content-Type':
        response.headers.get('Content-Type') ?? 'application/xml; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
