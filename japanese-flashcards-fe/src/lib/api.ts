import type { JLPTLevel, Word } from '../types';

const DEFAULT_BASE = 'https://kylht80rui.execute-api.ap-southeast-2.amazonaws.com/prod/game';
const API_BASE: string = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE;

export async function fetchWords(level: JLPTLevel): Promise<Word[]> {
  const url = `${API_BASE}?jlptLevel=${encodeURIComponent(level)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch words: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data?.success || !Array.isArray(data?.words)) {
    throw new Error('Unexpected API response');
  }
  return data.words as Word[];
} 