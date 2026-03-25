import type { TradeDecision } from '../types';

const DECISIONS_KEY = 'trader-diiz-decisions';

export const loadDecisions = (): TradeDecision[] => {
  try {
    const stored = localStorage.getItem(DECISIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load decisions:', error);
    return [];
  }
};

export const saveDecisions = (decisions: TradeDecision[]): void => {
  try {
    localStorage.setItem(DECISIONS_KEY, JSON.stringify(decisions));
  } catch (error) {
    console.error('Failed to save decisions:', error);
  }
};

export const addDecision = (decision: TradeDecision): void => {
  const decisions = loadDecisions();
  decisions.push(decision);
  saveDecisions(decisions);
};

// 初回起動時のみモックデータを投入する
export const initWithMockDataIfEmpty = (mockData: TradeDecision[]): void => {
  if (loadDecisions().length === 0) {
    saveDecisions(mockData);
  }
};