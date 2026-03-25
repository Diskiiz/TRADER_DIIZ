import { mockStocks } from '../data/mockStocks';

// シンプルなハッシュ関数（シード値生成用）
const hash = (str: string): number => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0; // unsigned 32bit
};

// 基準日からの日数を算出
const daysSince = (dateStr: string, baseDate = '2024-01-01'): number => {
  const a = new Date(baseDate).getTime();
  const b = new Date(dateStr).getTime();
  return Math.round((b - a) / 86400000);
};

/**
 * 特定日付の株価をシミュレートする（決定論的：同じ日付・銘柄なら常に同じ結果）
 * ランダムウォークで日々 ±1.5% 程度変動する
 */
export const getSimulatedPrice = (
  basePrice: number,
  stockCode: string,
  dateStr: string
): number => {
  const days = daysSince(dateStr);
  if (days <= 0) return basePrice;

  let price = basePrice;
  for (let d = 1; d <= days; d++) {
    const seed = hash(`${stockCode}-${d}`);
    // ±1.5% の範囲でランダムウォーク
    const change = ((seed % 1000) - 500) / 33333;
    price = price * (1 + change);
  }
  return Math.max(1, Math.round(price));
};

// 今日の各銘柄のシミュレート価格を取得
export const getTodayPrices = (): Record<string, number> => {
  const today = new Date().toISOString().slice(0, 10);
  const prices: Record<string, number> = {};
  mockStocks.forEach(s => {
    prices[s.code] = getSimulatedPrice(s.currentPrice, s.code, today);
  });
  return prices;
};

// 指定日の銘柄価格を取得（エントリー価格計算用）
export const getPriceOnDate = (stockCode: string, dateStr: string): number => {
  const stock = mockStocks.find(s => s.code === stockCode);
  if (!stock) return 0;
  return getSimulatedPrice(stock.currentPrice, stockCode, dateStr);
};
