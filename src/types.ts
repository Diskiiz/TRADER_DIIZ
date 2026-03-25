export type Action = 'BUY' | 'SELL' | 'HOLD';

export type Reason =
  | '上がりそう'
  | '下がりそう'
  | '割安だと思う'
  | 'ニュースが気になる'
  | '業績が良さそう'
  | 'チャートが強そう'
  | 'なんとなく';

export type Result = 'WIN' | 'LOSE' | 'NEUTRAL';

export interface Stock {
  code: string;
  name: string;
  market: string;
  sector: string;
  currentPrice: number;
}

export interface TradeDecision {
  id: string;
  date: string; // YYYY-MM-DD
  stockCode: string;
  stockName: string;
  action: Action;
  reason: Reason;
  note: string;
  shares: number;          // 株数（BUY/SELL の場合）
  entryPrice: number;
  evaluationPrice: number;
  assumedAmount: number;   // 投資額 = shares × entryPrice
  profitLoss: number;
  result: Result;
  antennaIds?: string[];   // 判断時に参考にしたアンテナ（分析用）
}

// ポートフォリオの個別ポジション
export interface Position {
  decisionId: string;
  stockCode: string;
  stockName: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  entryDate: string;
  investedAmount: number;   // shares × entryPrice
  currentValue: number;     // shares × currentPrice
  unrealizedPL: number;     // currentValue - investedAmount
  unrealizedPLRate: number; // unrealizedPL / investedAmount
}

// ポートフォリオ全体のサマリー
export interface PortfolioSummary {
  initialBalance: number;   // 初期仮想資金
  cashBalance: number;      // 現金残高
  investedAmount: number;   // 投資額合計
  currentValue: number;     // 評価額合計
  totalValue: number;       // 総資産 = 現金 + 評価額
  totalReturn: number;      // 含み損益合計
  totalReturnRate: number;  // 損益率
  positions: Position[];
}

// アンテナ: ユーザーが設定するニュース監視キーワードのまとまり
export interface Antenna {
  id: string;
  label: string;       // 表示名（例: "トヨタ自動車"）
  keywords: string[];  // 検索に使うキーワード群
  isActive: boolean;   // アクティブ（ニュース取得対象）かどうか
  createdAt: string;   // YYYY-MM-DD
  stockCodes?: string[]; // 関連銘柄コード（任意）
}

// ニュース記事（アンテナ経由で取得）
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  antennaId: string;
}

export interface UserStats {
  totalCount: number;
  winCount: number;
  loseCount: number;
  neutralCount: number;
  winRate: number;
  averageProfitLoss: number;
  reasonBreakdown: Record<Reason, number>;
  stockBreakdown: Record<string, number>;
}