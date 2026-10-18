import type { ICountRow } from '@/interfaces';

export const formatWait = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};

export const titleCase = (value: string): string =>
  value.replaceAll('_', ' ').replace(/^\w/, (char) => char.toUpperCase());

export const sumCounts = (rows: ICountRow[]): number => rows.reduce((sum, row) => sum + row.count, 0);
