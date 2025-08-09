import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Word } from '../types';

const FAVORITES_KEY = 'jfc_favorites_v1';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useLocalStorage<Word[]>(FAVORITES_KEY, []);

  const removeFavorite = (word: Word) => {
    setFavorites((prev) => prev.filter((w) => w.id !== word.id));
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4">
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Favorites</h2>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>Home</button>
        </div>
        {favorites.length === 0 ? (
          <p className="text-neutral-500">No saved words yet.</p>
        ) : (
          <div className="grid gap-3">
            {favorites.map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-neutral-500">{w.meaning}</div>
                  <div className="text-lg font-medium">{w.expression} <span className="font-mono text-neutral-500">{w.reading}</span></div>
                  <div className="text-xs text-neutral-400">Level {w.level}</div>
                </div>
                <button 
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100" 
                  onClick={() => removeFavorite(w)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 