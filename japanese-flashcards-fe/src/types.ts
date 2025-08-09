export type Word = {
  id: number;
  meaning: string;
  expression: string;
  reading: string;
  level: string; // e.g., "N5", "N4", ..., "N1"
  hiddenReading: string; // contains a single underscore _
  correctChar: string;
  options: string[];
};

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'all';

export type RoundResult = {
  word: Word;
  selectedOption: string | null;
  isCorrect: boolean;
  timeTakenMs: number;
};

export type GameResult = {
  id: string; // timestamp-based id
  startedAt: number;
  completedAt: number;
  level: JLPTLevel;
  score: number; // 0..10
  rounds: RoundResult[]; // length 10
}; 