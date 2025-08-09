import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Results from '../components/Results';
import type { GameResult, Word } from '../types';

const HISTORY_KEY = 'jfc_history_v1';
const FAVORITES_KEY = 'jfc_favorites_v1';

export default function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const gameId = searchParams.get('gameId');
  
  const [history] = useLocalStorage<GameResult[]>(HISTORY_KEY, []);
  const [favorites, setFavorites] = useLocalStorage<Word[]>(FAVORITES_KEY, []);
  
  const resultFromState = (location.state as any)?.result as GameResult | undefined;
  const result = resultFromState ?? history.find(g => g.id === gameId);

  const toggleFavorite = (word: Word) => {
    setFavorites((prev) => {
      const exists = prev.some((w) => w.id === word.id);
      if (exists) return prev.filter((w) => w.id !== word.id);
      return [word, ...prev].slice(0, 200);
    });
  };

  if (!result) {
    return (
      <div className="mx-auto max-w-xl px-4">
        <div className="card p-6">
          <p className="text-red-600">Game result not found</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <Results
      result={result}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onPlayAgain={() => navigate('/')}
      onGoHome={() => navigate('/')}
    />
  );
} 