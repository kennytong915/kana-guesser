import { useState } from 'react';
import type { JLPTLevel } from '../types';
import { motion } from 'framer-motion';

type Props = {
  defaultLevel?: JLPTLevel;
  onStart: (level: JLPTLevel) => void;
  showIntro?: boolean;
};

const levelOptions: { value: JLPTLevel; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
  { value: 'N2', label: 'N2' },
  { value: 'N1', label: 'N1' },
];

export default function LevelMenu({ defaultLevel = 'all', onStart, showIntro = true }: Props) {
  const [level, setLevel] = useState<JLPTLevel>(defaultLevel);

  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="card p-6"
      >
        <div className="space-y-5">
          {showIntro && (
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Hidden Kana</h2>
              <p className="text-sm text-neutral-600">
                Guess the hidden kana character in each word. 10 rounds, 20 seconds per word, +1 for each correct answer.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="level" className="text-sm font-medium">JLPT Level</label>
            <select
              id="level"
              className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-700"
              value={level}
              onChange={(e) => setLevel(e.target.value as JLPTLevel)}
            >
              {levelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-1">
            <button className="btn btn-primary w-full" onClick={() => onStart(level)}>
              Start
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 