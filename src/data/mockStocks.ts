import type { Stock } from '../types';

export const mockStocks: Stock[] = [
  {
    code: '7203',
    name: 'トヨタ自動車',
    market: '東証プライム',
    sector: '自動車',
    currentPrice: 2500,
  },
  {
    code: '6758',
    name: 'ソニーグループ',
    market: '東証プライム',
    sector: '電気機器',
    currentPrice: 12000,
  },
  {
    code: '8306',
    name: '三菱UFJフィナンシャル・グループ',
    market: '東証プライム',
    sector: '銀行業',
    currentPrice: 800,
  },
  {
    code: '9984',
    name: 'ソフトバンクグループ',
    market: '東証プライム',
    sector: '情報・通信業',
    currentPrice: 6000,
  },
];