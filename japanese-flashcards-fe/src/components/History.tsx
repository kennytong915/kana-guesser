import { useState } from 'react';
import type { GameResult, Word } from '../types';

type Props = {
  history: GameResult[];
  favorites: Word[];
  onToggleFavorite: (word: Word) => void;
  onClose: () => void;
};

export default function History({ history, favorites, onToggleFavorite, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  function isFavorited(word: Word) {
    return favorites.some((w) => w.id === word.id);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Games</h2>
          <button className="btn btn-ghost" onClick={onClose}>Home</button>
        </div>
        {history.length === 0 ? (
          <p className="text-neutral-500">No recent games yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((g) => (
              <div key={g.id} className="rounded-xl border border-neutral-200">
                <button
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-neutral-50"
                  onClick={() => setExpanded((e) => (e === g.id ? null : g.id))}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-neutral-500">
                      {new Date(g.completedAt).toLocaleString()} · {g.level === 'all' ? 'All levels' : `Level ${g.level}`}
                    </div>
                    <div className="font-medium">Score {g.score} / {g.rounds.length}</div>
                  </div>
                  <div className="text-neutral-400">{expanded === g.id ? '−' : '+'}</div>
                </button>
                {expanded === g.id && (
                  <div className="space-y-2 p-4 pt-0">
                    {g.rounds.map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm text-neutral-500">{r.word.meaning}</div>
                          <div className="flex items-center gap-2 text-lg font-medium">
                            <span>{r.word.expression}</span>
                            <span className="font-mono text-neutral-500">{r.word.hiddenReading}</span>
                            <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-600">{r.word.level}</span>
                          </div>
                          <div className="text-sm">
                            <span className={r.isCorrect ? 'text-green-600' : 'text-red-600'}>
                              {r.isCorrect ? 'Correct' : 'Wrong'}
                            </span>
                          </div>
                        </div>
                        <button
                          className={
                            'ml-3 rounded-lg border px-3 py-2 text-sm transition ' +
                            (isFavorited(r.word)
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                              : 'border-neutral-200 hover:bg-neutral-100')
                          }
                          onClick={() => onToggleFavorite(r.word)}
                        >
                          {isFavorited(r.word) ? 'Saved' : 'Save'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 