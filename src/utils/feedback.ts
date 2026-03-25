import type { TradeDecision, UserStats } from '../types';

// ルールベースのフィードバック生成
// 各ルールは独立した関数として分離し、後で拡張しやすくする
type FeedbackRule = (stats: UserStats, decisions: TradeDecision[]) => string | null;

const ruleNantonakuWinRate: FeedbackRule = (_stats, decisions) => {
  const targets = decisions.filter(d => d.reason === 'なんとなく');
  if (targets.length < 3) return null;
  const wins = targets.filter(d => d.result === 'WIN').length;
  const rate = wins / targets.length;
  if (rate >= 0.4) return null;
  return `「なんとなく」での判断が ${targets.length} 件ありますが、勝率は ${Math.round(rate * 100)}% です。判断理由を明確にしてみましょう。`;
};

const ruleHoldTooFew: FeedbackRule = (stats, decisions) => {
  if (stats.totalCount < 5) return null;
  const holdRate = decisions.filter((d: TradeDecision) => d.action === 'HOLD').length / stats.totalCount;
  if (holdRate >= 0.1) return null;
  return 'HOLD（様子見）の割合が非常に低いです。焦らず待つ判断も投資では重要です。';
};

const ruleStockConcentration: FeedbackRule = (stats, _decisions) => {
  if (stats.totalCount < 5) return null;
  for (const [code, count] of Object.entries(stats.stockBreakdown)) {
    if (count / stats.totalCount > 0.6) {
      return `銘柄 ${code} への集中度が高いです（${count}/${stats.totalCount} 件）。分散を意識してみましょう。`;
    }
  }
  return null;
};

const ruleReasonWinRate: FeedbackRule = (_stats, decisions) => {
  const groups: Record<string, TradeDecision[]> = {};
  decisions.forEach(d => {
    groups[d.reason] = groups[d.reason] ?? [];
    groups[d.reason].push(d);
  });
  for (const [reason, group] of Object.entries(groups)) {
    if (group.length < 3) continue;
    const wins = group.filter(d => d.result === 'WIN').length;
    const rate = wins / group.length;
    if (rate < 0.3) {
      return `「${reason}」を理由にした判断の勝率が ${Math.round(rate * 100)}% と低いです（${group.length} 件）。`;
    }
  }
  return null;
};

const RULES: FeedbackRule[] = [
  ruleNantonakuWinRate,
  ruleHoldTooFew,
  ruleStockConcentration,
  ruleReasonWinRate,
];

export const generateFeedback = (
  stats: UserStats,
  decisions: TradeDecision[]
): string[] => {
  const messages = RULES.map(rule => rule(stats, decisions)).filter(
    (msg): msg is string => msg !== null
  );
  return messages;
};
