import { useState, useMemo } from 'react';
import { Tabs, TabItem } from '@serendie/ui';
import { loadDecisions } from '../utils/storage';
import { computePortfolio, formatMoney, formatPLRate, INITIAL_BALANCE } from '../utils/portfolio';
import { getTodayPrices } from '../utils/priceSimulator';
import { computeStats } from '../utils/stats';
import { generateFeedback } from '../utils/feedback';
import type { Position } from '../types';

// ── ポートフォリオタブ ──────────────────────────────────────────

const PortfolioTab = () => {
  const decisions = useMemo(() => loadDecisions(), []);
  const currentPrices = useMemo(() => getTodayPrices(), []);
  const portfolio = useMemo(
    () => computePortfolio(decisions, currentPrices),
    [decisions, currentPrices]
  );

  const returnClass = portfolio.totalReturn >= 0 ? 'text-profit' : 'text-loss';

  return (
    <div className="portfolio-view">
      {/* サマリーカード */}
      <div className="portfolio-summary">
        <div className="pf-summary-row">
          <span className="pf-label">総資産</span>
          <span className="pf-value-large">{formatMoney(portfolio.totalValue)}</span>
        </div>
        <div className="pf-divider" />
        <div className="pf-summary-grid">
          <div className="pf-summary-item">
            <span className="pf-label">初期資金</span>
            <span className="pf-value">{formatMoney(INITIAL_BALANCE)}</span>
          </div>
          <div className="pf-summary-item">
            <span className="pf-label">現金残高</span>
            <span className="pf-value">{formatMoney(portfolio.cashBalance)}</span>
          </div>
          <div className="pf-summary-item">
            <span className="pf-label">投資額合計</span>
            <span className="pf-value">{formatMoney(portfolio.investedAmount)}</span>
          </div>
          <div className="pf-summary-item">
            <span className="pf-label">評価額合計</span>
            <span className="pf-value">{formatMoney(portfolio.currentValue)}</span>
          </div>
        </div>
        <div className="pf-return-row">
          <span className="pf-label">含み損益</span>
          <div>
            <span className={`pf-return-value ${returnClass}`}>
              {portfolio.totalReturn >= 0 ? '+' : ''}{formatMoney(portfolio.totalReturn)}
            </span>
            <span className={`pf-return-rate ${returnClass}`}>
              （{formatPLRate(portfolio.totalReturnRate)}）
            </span>
          </div>
        </div>
      </div>

      {/* ポジション一覧 */}
      <p className="section-title">保有ポジション</p>

      {portfolio.positions.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          BUY を記録するとポジションが表示されます。
        </p>
      ) : (
        <div className="position-list">
          {portfolio.positions.map(pos => (
            <PositionCard key={pos.decisionId} pos={pos} />
          ))}
        </div>
      )}
    </div>
  );
};

const PositionCard = ({ pos }: { pos: Position }) => {
  const plClass = pos.unrealizedPL >= 0 ? 'text-profit' : 'text-loss';
  return (
    <div className="position-card">
      <div className="position-header">
        <div>
          <span className="position-code">{pos.stockCode}</span>
          <span className="position-name">{pos.stockName}</span>
        </div>
        <div className={`position-pl ${plClass}`}>
          {pos.unrealizedPL >= 0 ? '+' : ''}{formatMoney(pos.unrealizedPL)}
          <span className="position-pl-rate">（{formatPLRate(pos.unrealizedPLRate)}）</span>
        </div>
      </div>
      <div className="position-meta">
        <span>保有株数: {pos.shares.toLocaleString()} 株</span>
        <span>取得単価: ¥{pos.entryPrice.toLocaleString()}</span>
        <span>現在値: ¥{pos.currentPrice.toLocaleString()}</span>
        <span>評価額: {formatMoney(pos.currentValue)}</span>
      </div>
      <div className="position-date">取得日: {pos.entryDate}</div>
    </div>
  );
};

// ── 統計タブ ──────────────────────────────────────────

const StatsTab = () => {
  const decisions = useMemo(() => loadDecisions(), []);
  const stats = useMemo(() => computeStats(decisions), [decisions]);
  const feedbacks = useMemo(() => generateFeedback(stats, decisions), [stats, decisions]);

  const reasonEntries = Object.entries(stats.reasonBreakdown)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a);

  const stockEntries = Object.entries(stats.stockBreakdown)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="stats-page">
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
          <span className={`stat-value ${stats.averageProfitLoss >= 0 ? 'text-profit' : 'text-loss'}`}>
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

      <p className="section-title">フィードバック</p>
      {decisions.length === 0 ? (
        <div className="feedback-empty">
          判断を記録するとフィードバックが表示されます。
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="feedback-empty">
          現時点では特に改善ポイントはありません。引き続き記録しましょう！
        </div>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((msg, i) => (
            <div key={i} className="feedback-item">{msg}</div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── メインページ ──────────────────────────────────────────

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div>
      <Tabs
        value={activeTab}
        onValueChange={(details: { value: string }) => setActiveTab(details.value)}
      >
        <TabItem value="portfolio" title="ポートフォリオ" />
        <TabItem value="stats" title="統計・分析" />
      </Tabs>

      <div style={{ marginTop: 16 }}>
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'stats' && <StatsTab />}
      </div>
    </div>
  );
};

export default ReportPage;
