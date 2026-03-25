import { useState, useEffect, useCallback } from 'react';
import { Button, TextField } from '@serendie/ui';
import { SerendieSymbol } from '@serendie/symbols';
import {
  loadAntennas,
  addAntenna,
  deleteAntenna,
  toggleAntenna,
} from '../utils/antennaStorage';
import { fetchAllActiveNews, formatPubDate } from '../utils/newsApi';
import type { Antenna, NewsItem } from '../types';

const NewsPage = () => {
  const [antennas, setAntennas] = useState<Antenna[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // 新規アンテナ追加フォーム
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newKeywords, setNewKeywords] = useState('');

  useEffect(() => {
    const stored = loadAntennas();
    setAntennas(stored);
  }, []);

  const fetchNews = useCallback(async (currentAntennas: Antenna[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await fetchAllActiveNews(currentAntennas);
      setNews(items);
      setLastFetched(new Date());
    } catch (e) {
      setError('ニュースの取得に失敗しました。ネットワークを確認してください。');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // アンテナが変わったら自動で再取得
  const handleToggle = (id: string) => {
    toggleAntenna(id);
    const updated = loadAntennas();
    setAntennas(updated);
    fetchNews(updated);
  };

  const handleDelete = (id: string) => {
    deleteAntenna(id);
    setAntennas(loadAntennas());
  };

  const handleAddAntenna = () => {
    const label = newLabel.trim();
    if (!label) return;
    const keywords = newKeywords
      ? newKeywords.split(/[,、\s]+/).map(k => k.trim()).filter(Boolean)
      : [label];
    const antenna: Antenna = {
      id: `ant-${Date.now()}`,
      label,
      keywords,
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addAntenna(antenna);
    const updated = loadAntennas();
    setAntennas(updated);
    setNewLabel('');
    setNewKeywords('');
    setShowAddForm(false);
    fetchNews(updated);
  };

  // 初回マウント時にニュース取得
  useEffect(() => {
    const stored = loadAntennas();
    if (stored.length > 0) fetchNews(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const antennaLabelById = (id: string) =>
    antennas.find(a => a.id === id)?.label ?? id;

  return (
    <div className="news-page">
      {/* ── アンテナ管理 ── */}
      <div className="antenna-section">
        <div className="antenna-header">
          <span className="section-title" style={{ margin: 0 }}>アンテナ</span>
          <Button
            styleType="ghost"
            size="small"
            onClick={() => fetchNews(antennas)}
            disabled={isLoading}
          >
            <SerendieSymbol name="refresh" variant="outlined" size={16} />
            {isLoading ? '取得中…' : '更新'}
          </Button>
        </div>
        <p className="antenna-hint">
          タップで ON/OFF。アクティブなアンテナのニュースを取得します。
        </p>

        {/* タグクラウド */}
        <div className="antenna-tags">
          {antennas.map(ant => (
            <div key={ant.id} className="antenna-tag-wrapper">
              <button
                className={`antenna-tag ${ant.isActive ? 'is-active' : ''}`}
                onClick={() => handleToggle(ant.id)}
                title={ant.keywords.join(', ')}
              >
                {ant.label}
              </button>
              <button
                className="antenna-delete"
                onClick={() => handleDelete(ant.id)}
                aria-label={`${ant.label}を削除`}
              >
                ×
              </button>
            </div>
          ))}

          {/* 追加ボタン */}
          <button
            className="antenna-add-btn"
            onClick={() => setShowAddForm(v => !v)}
          >
            ＋ アンテナを追加
          </button>
        </div>

        {/* 追加フォーム */}
        {showAddForm && (
          <div className="antenna-add-form">
            <TextField
              label="アンテナ名"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="例: 半導体関連"
            />
            <TextField
              label="検索キーワード（カンマ区切り、省略可）"
              value={newKeywords}
              onChange={e => setNewKeywords(e.target.value)}
              placeholder="例: 半導体, TSMC, エヌビディア"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button styleType="filled" size="small" onClick={handleAddAntenna}>
                追加する
              </Button>
              <Button
                styleType="ghost"
                size="small"
                onClick={() => { setShowAddForm(false); setNewLabel(''); setNewKeywords(''); }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── ニュース一覧 ── */}
      <div className="news-feed-header">
        <span className="section-title" style={{ margin: 0 }}>
          ニュース {news.length > 0 && `(${news.length}件)`}
        </span>
        {lastFetched && (
          <span className="news-last-fetched">
            {lastFetched.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 更新
          </span>
        )}
      </div>

      {error && (
        <div className="news-error">{error}</div>
      )}

      {isLoading && (
        <div className="news-loading">
          <SerendieSymbol name="loader" variant="outlined" size={24} />
          ニュースを取得中…
        </div>
      )}

      {!isLoading && !error && news.length === 0 && (
        <div className="news-empty">
          {antennas.filter(a => a.isActive).length === 0
            ? 'アンテナを ON にするとニュースが表示されます。'
            : 'ニュースが見つかりませんでした。「更新」を試してください。'}
        </div>
      )}

      <div className="news-list">
        {news.map(item => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card"
          >
            <div className="news-card-meta">
              <span className="news-antenna-tag">
                {antennaLabelById(item.antennaId)}
              </span>
              <span className="news-date">{formatPubDate(item.publishedAt)}</span>
            </div>
            <div className="news-title">{item.title}</div>
            {item.source && (
              <div className="news-source">{item.source}</div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
