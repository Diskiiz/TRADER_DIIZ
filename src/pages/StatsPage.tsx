import { useMemo } from 'react';
import { loadDecisions } from '../utils/storage';
import { computeStats } from '../utils/stats';
import { generateFeedback } from '../utils/feedback';

const StatsPage = () => {
  const decisions = useMemo(() => loadDecisions(), []);
  const stats = useMemo(() => computeStats(decisions), [decisions]);
  const feedbacks = useMemo(() => generateFeedback(stats, decisions), [stats, decisions]);

  const reasonEntries = Object.entries(stats.reasonBreakdown)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const stockEntries = Object.entries(stats.stockBreakdown)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="stats-page">
      <h2 style={{ margin: '0 0 16px' }}>統計</h2>

      {/* サマリーカード */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">総判断数</span>
          <span className="stat-value">{stats.totalCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">勝率</span>
          <span className="stat-value">
            {stats.totalCount > 0 ? `${Math.round(stats.winRate * 100)}%` : '—'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">平均損益</span>
          <span
            className={`stat-value ${stats.averageProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}
          >
            {stats.totalCount > 0
              ? `${stats.averageProfitLoss >= 0 ? '+' : ''}¥${Math.round(stats.averageProfitLoss).toLocaleString()}`
              : '—'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">勝 / 負 / 中立</span>
          <span className="stat-value">
            {stats.winCount} / {stats.loseCount} / {stats.neutralCount}
          </span>
        </div>
      </div>

      {/* 理由別件数 */}
      {reasonEntries.length > 0 && (
        <>
          <p className="section-title">理由別件数</p>
          <div className="breakdown-list">
            {reasonEntries.map(([reason, count]) => (
              <div key={reason} className="breakdown-item">
                <span>{reason}</span>
                <span className="breakdown-count">{count} 件</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 銘柄別件数 */}
      {stockEntries.length > 0 && (
        <>
          <p className="section-title">銘柄別件数</p>
          <div className="breakdown-list">
            {stockEntries.map(([code, count]) => (
              <div key={code} className="breakdown-item">
                <span>{code}</span>
                <span className="breakdown-count">{count} 件</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* フィードバック */}
      <p className="section-title">フィードバック</p>
      {decisions.length === 0 ? (
        <div className="feedback-empty">
          判断を記録するとフィードバックが表示されます。
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="feedback-empty">
          現時点では特に改善ポイントはありません。引き続き判断を記録しましょう！
        </div>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((msg, i) => (
            <div key={i} className="feedback-item">
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatsPage;
