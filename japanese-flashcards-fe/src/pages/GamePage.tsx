import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Game from '../components/Game';
import type { GameResult, JLPTLevel } from '../types';

const HISTORY_KEY = 'jfc_history_v1';

export default function GamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const level = (searchParams.get('level') as JLPTLevel) || 'all';
  const [history, setHistory] = useLocalStorage<GameResult[]>(HISTORY_KEY, []);

  const handleComplete = (result: GameResult) => {
    // Store up to 10 recent games (most recent first)
    setHistory((prev) => [result, ...prev].slice(0, 10));
    navigate(`/results?gameId=${result.id}`, { state: { result } });
  };

  return <Game level={level} onComplete={handleComplete} />;
} 