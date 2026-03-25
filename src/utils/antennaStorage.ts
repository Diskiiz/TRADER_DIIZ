import type { Antenna } from '../types';
import { defaultAntennas } from '../data/defaultAntennas';

const ANTENNAS_KEY = 'trader-diiz-antennas';

export const loadAntennas = (): Antenna[] => {
  try {
    const stored = localStorage.getItem(ANTENNAS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveAntennas = (antennas: Antenna[]): void => {
  try {
    localStorage.setItem(ANTENNAS_KEY, JSON.stringify(antennas));
  } catch (e) {
    console.error('Failed to save antennas:', e);
  }
};

// 初回起動時のみデフォルトアンテナを投入
export const initAntennasIfEmpty = (): void => {
  if (loadAntennas().length === 0) {
    saveAntennas(defaultAntennas);
  }
};

export const addAntenna = (antenna: Antenna): void => {
  const antennas = loadAntennas();
  antennas.push(antenna);
  saveAntennas(antennas);
};

export const deleteAntenna = (id: string): void => {
  const antennas = loadAntennas().filter(a => a.id !== id);
  saveAntennas(antennas);
};

export const toggleAntenna = (id: string): void => {
  const antennas = loadAntennas().map(a =>
    a.id === id ? { ...a, isActive: !a.isActive } : a
  );
  saveAntennas(antennas);
};

export const updateAntenna = (updated: Antenna): void => {
  const antennas = loadAntennas().map(a => a.id === updated.id ? updated : a);
  saveAntennas(antennas);
};
