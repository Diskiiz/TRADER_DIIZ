import { useMemo } from 'react';
import { loadDecisions } from '../utils/storage';
import type { Action, Result } from '../types';

const ACTION_LABELS: Record<Action, string> = {
  BUY: '買い', SELL: '売り', HOLD: '様子見',
};

const RESULT_LABELS: Record<Result, string> = {
  WIN: '利益', LOSE: '損失', NEUTRAL: '中立',
};

const HistoryPage = () => {
  const decisions = useMemo(
    () => [...loadDecisions()].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );

  return (
    <div>
      <h2 style={{ margin: '0 0 4px' }}>判断履歴</h2>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>
        {decisions.length} 件の記録
      </p>

      {decisions.length === 0 ? (
        <p className="history-empty">まだ判断が記録されていません。<br />ホーム画面から最初の判断を記録しましょう！</p>
      ) : (
        <div className="history-list">
          {decisions.map(d => (
            <div
              key={d.id}
              className={`history-card result-${d.result.toLowerCase()}`}
            >
              <div className="history-header">
                <span className="history-date">{d.date}</span>
                <span className={`badge badge-${d.action.toLowerCase()}`}>
                  {ACTION_LABELS[d.action]}
                </span>
                <span className={`badge badge-${d.result.toLowerCase()}`}>
                  {RESULT_LABELS[d.result]}
                </span>
              </div>

              <div className="history-stock">
                {d.stockCode} {d.stockName}
              </div>

              <div className="history-meta">
                <span>理由: {d.reason}</span>
                <span>エントリー: ¥{d.entryPrice.toLocaleString()}</span>
                {d.evaluationPrice !== d.entryPrice && (
                  <span>評価額: ¥{d.evaluationPrice.toLocaleString()}</span>
                )}
                <span className={d.profitLoss >= 0 ? 'text-profit' : 'text-loss'}>
                  損益: {d.profitLoss >= 0 ? '+' : ''}¥{d.profitLoss.toLocaleString()}
                </span>
              </div>

              {d.note && (
                <div className="history-note">メモ: {d.note}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
