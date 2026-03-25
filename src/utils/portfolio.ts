import type { TradeDecision, Position, PortfolioSummary } from '../types';

export const INITIAL_BALANCE = 1_000_000; // 初期仮想資金

export const computePortfolio = (
  decisions: TradeDecision[],
  currentPrices: Record<string, number>
): PortfolioSummary => {
  // BUY かつ shares > 0 のみポジションとして扱う
  const positions: Position[] = decisions
    .filter(d => d.action === 'BUY' && d.shares > 0)
    .map(d => {
      const currentPrice = currentPrices[d.stockCode] ?? d.entryPrice;
      const investedAmount = d.shares * d.entryPrice;
      const currentValue = d.shares * currentPrice;
      const unrealizedPL = currentValue - investedAmount;
      return {
        decisionId: d.id,
        stockCode: d.stockCode,
        stockName: d.stockName,
        shares: d.shares,
        entryPrice: d.entryPrice,
        currentPrice,
        entryDate: d.date,
        investedAmount,
        currentValue,
        unrealizedPL,
        unrealizedPLRate: investedAmount > 0 ? unrealizedPL / investedAmount : 0,
      };
    });

  const investedAmount = positions.reduce((s, p) => s + p.investedAmount, 0);
  const currentValue  = positions.reduce((s, p) => s + p.currentValue, 0);
  const cashBalance   = Math.max(0, INITIAL_BALANCE - investedAmount);
  const totalValue    = cashBalance + currentValue;
  const totalReturn   = totalValue - INITIAL_BALANCE;

  return {
    initialBalance: INITIAL_BALANCE,
    cashBalance,
    investedAmount,
    currentValue,
    totalValue,
    totalReturn,
    totalReturnRate: totalReturn / INITIAL_BALANCE,
    positions,
  };
};

export const formatMoney = (n: number): string =>
  `¥${Math.round(n).toLocaleString('ja-JP')}`;

export const formatPLRate = (rate: number): string =>
  `${rate >= 0 ? '+' : ''}${(rate * 100).toFixed(2)}%`;
