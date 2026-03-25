import type { TradeDecision, UserStats, Reason } from '../types';

const ALL_REASONS: Reason[] = [
  '上がりそう', '下がりそう', '割安だと思う',
  'ニュースが気になる', '業績が良さそう', 'チャートが強そう', 'なんとなく',
];

export const computeStats = (decisions: TradeDecision[]): UserStats => {
  const totalCount = decisions.length;
  const winCount = decisions.filter(d => d.result === 'WIN').length;
  const loseCount = decisions.filter(d => d.result === 'LOSE').length;
  const neutralCount = decisions.filter(d => d.result === 'NEUTRAL').length;
  const winRate = totalCount > 0 ? winCount / totalCount : 0;
  const averageProfitLoss =
    totalCount > 0
      ? decisions.reduce((sum, d) => sum + d.profitLoss, 0) / totalCount
      : 0;

  const reasonBreakdown = Object.fromEntries(
    ALL_REASONS.map(r => [r, 0])
  ) as Record<Reason, number>;
  decisions.forEach(d => {
    reasonBreakdown[d.reason] = (reasonBreakdown[d.reason] ?? 0) + 1;
  });

  const stockBreakdown: Record<string, number> = {};
  decisions.forEach(d => {
    stockBreakdown[d.stockCode] = (stockBreakdown[d.stockCode] ?? 0) + 1;
  });

  return {
    totalCount,
    winCount,
    loseCount,
    neutralCount,
    winRate,
    averageProfitLoss,
    reasonBreakdown,
    stockBreakdown,
  };
};
