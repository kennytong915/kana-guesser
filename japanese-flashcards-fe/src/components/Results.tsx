import { motion } from 'framer-motion';
import type { GameResult, Word } from '../types';

type Props = {
  result: GameResult;
  favorites: Word[];
  onToggleFavorite: (word: Word) => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
};

function isFavorited(favorites: Word[], word: Word) {
  return favorites.some((w) => w.id === word.id);
}

export default function Results({ result, favorites, onToggleFavorite, onPlayAgain, onGoHome }: Props) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="card p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Results</h2>
            <p className="text-neutral-500">Score: {result.score} / {result.rounds.length}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={onGoHome}>Home</button>
            <button className="btn btn-primary" onClick={onPlayAgain}>Play again</button>
          </div>
        </div>

        <div className="space-y-3">
          {result.rounds.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
              <div className="min-w-0">
                <div className="truncate text-sm text-neutral-500">{r.word.meaning}</div>
                <div className="text-lg font-medium">{r.word.expression} <span className="font-mono text-neutral-500">{r.word.hiddenReading}</span></div>
                <div className="text-sm">
                  <span className={r.isCorrect ? 'text-green-600' : 'text-red-600'}>
                    {r.isCorrect ? 'Correct' : 'Wrong'}
                  </span>
                  <span className="text-neutral-400"> · </span>
                  <span className="text-neutral-500">Answer: {r.word.correctChar} </span>
                  {r.selectedOption && r.selectedOption !== r.word.correctChar && (
                    <span className="text-neutral-500">(you: {r.selectedOption})</span>
                  )}
                </div>
              </div>
              <button
                className={
                  'ml-3 rounded-lg border px-3 py-2 text-sm transition ' +
                  (isFavorited(favorites, r.word)
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-neutral-200 hover:bg-neutral-100')
                }
                onClick={() => onToggleFavorite(r.word)}
              >
                {isFavorited(favorites, r.word) ? 'Saved' : 'Save'}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 