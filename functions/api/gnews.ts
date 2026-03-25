// Cloudflare Pages Function: /api/gnews
// 開発時は vite.config.ts のプロキシが担当
// 本番（Cloudflare Pages）ではこの Function が Google News RSS をプロキシする

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // クエリパラメータを Google News RSS に転送
  const targetUrl = new URL('https://news.google.com/rss/search');
  url.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

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
      'Cache-Control': 'public, max-age=300', // 5分キャッシュ
    },
  });
};
