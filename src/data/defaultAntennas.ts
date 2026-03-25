import type { Antenna } from '../types';

// 初回起動時に投入するデフォルトアンテナ
// 銘柄単位 + セクター単位でニュースを追いやすくする
export const defaultAntennas: Antenna[] = [
  {
    id: 'ant-7203',
    label: 'トヨタ自動車',
    keywords: ['トヨタ自動車', '7203', 'TOYOTA'],
    isActive: true,
    createdAt: '2024-01-01',
    stockCodes: ['7203'],
  },
  {
    id: 'ant-6758',
    label: 'ソニーグループ',
    keywords: ['ソニーグループ', '6758', 'Sony'],
    isActive: true,
    createdAt: '2024-01-01',
    stockCodes: ['6758'],
  },
  {
    id: 'ant-8306',
    label: '三菱UFJ',
    keywords: ['三菱UFJ', '8306', 'MUFG'],
    isActive: false,
    createdAt: '2024-01-01',
    stockCodes: ['8306'],
  },
  {
    id: 'ant-9984',
    label: 'ソフトバンクG',
    keywords: ['ソフトバンクグループ', '9984', 'SoftBank'],
    isActive: false,
    createdAt: '2024-01-01',
    stockCodes: ['9984'],
  },
  {
    id: 'ant-ev',
    label: 'EV・電動化',
    keywords: ['EV', '電気自動車', '電動化', 'テスラ'],
    isActive: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'ant-ai',
    label: 'AI・半導体',
    keywords: ['AI', '半導体', '生成AI', 'NVIDIA'],
    isActive: false,
    createdAt: '2024-01-01',
  },
  {
    id: 'ant-finance',
    label: '金融・金利',
    keywords: ['日銀', '金利', '為替', '円安'],
    isActive: false,
    createdAt: '2024-01-01',
  },
];
