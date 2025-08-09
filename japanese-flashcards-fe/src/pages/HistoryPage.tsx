import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import History from '../components/History';
import type { GameResult, Word } from '../types';

const HISTORY_KEY = 'jfc_history_v1';
const FAVORITES_KEY = 'jfc_favorites_v1';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history] = useLocalStorage<GameResult[]>(HISTORY_KEY, []);
  const [favorites, setFavorites] = useLocalStorage<Word[]>(FAVORITES_KEY, []);

  const toggleFavorite = (word: Word) => {
    setFavorites((prev) => {
      const exists = prev.some((w) => w.id === word.id);
      if (exists) return prev.filter((w) => w.id !== word.id);
      return [word, ...prev].slice(0, 200);
    });
  };

  return (
    <History
      history={history}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      onClose={() => navigate('/')}
    />
  );
} 