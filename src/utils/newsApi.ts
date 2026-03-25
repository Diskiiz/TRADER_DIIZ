import type { Antenna, NewsItem } from '../types';

// Vite proxy: /api/gnews → https://news.google.com/rss/search
const GNEWS_PROXY = '/api/gnews';

const parseRSS = (xmlText: string, antennaId: string): NewsItem[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  if (doc.querySelector('parsererror')) return [];

  return Array.from(doc.querySelectorAll('item'))
    .slice(0, 8)
    .map((item, i) => {
      const title = getText(item, 'title');
      // Google News RSS では <link> が空のことがある。<guid> を代替に使う
      const url =
        getText(item, 'link') || getText(item, 'guid') || '';
      const source = getText(item, 'source');
      const pubDate = getText(item, 'pubDate');

      return {
        id: `${antennaId}-${i}-${Date.now()}`,
        title: cleanCDATA(title),
        url,
        source: cleanCDATA(source),
        publishedAt: pubDate,
        antennaId,
      };
    })
    .filter(item => item.title.length > 0);
};

const getText = (el: Element, tag: string): string =>
  el.querySelector(tag)?.textContent?.trim() ?? '';

const cleanCDATA = (text: string): string =>
  text.replace(/<!\[CDATA\[|\]\]>/g, '').trim();

export const fetchNewsForAntenna = async (
  antenna: Antenna
): Promise<NewsItem[]> => {
  // 複数キーワードは先頭を使用（Google News は長いクエリが不安定なため）
  const query = antenna.keywords[0] ?? antenna.label;
  const params = new URLSearchParams({
    q: query,
    hl: 'ja',
    gl: 'JP',
    ceid: 'JP:ja',
  });
  const res = await fetch(`${GNEWS_PROXY}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xmlText = await res.text();
  return parseRSS(xmlText, antenna.id);
};

// アクティブなアンテナすべてのニュースを並列取得してマージ・日付順ソート
export const fetchAllActiveNews = async (
  antennas: Antenna[]
): Promise<NewsItem[]> => {
  const active = antennas.filter(a => a.isActive);
  if (active.length === 0) return [];

  const results = await Promise.allSettled(
    active.map(a => fetchNewsForAntenna(a))
  );

  const items: NewsItem[] = [];
  results.forEach(r => {
    if (r.status === 'fulfilled') items.push(...r.value);
  });

  // 日付の新しい順にソート（重複タイトルは除去）
  const seen = new Set<string>();
  return items
    .filter(item => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    })
    .sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
};

export const formatPubDate = (pubDate: string): string => {
  if (!pubDate) return '';
  try {
    return new Date(pubDate).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return pubDate;
  }
};
