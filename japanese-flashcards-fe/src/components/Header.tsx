import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
      <motion.h1
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-xl font-semibold tracking-tight cursor-pointer"
        onClick={() => navigate('/')}
      >
        KanaGuesser
      </motion.h1>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost" onClick={() => navigate('/favorites')}>Favorites</button>
        <button className="btn btn-ghost" onClick={() => navigate('/history')}>History</button>
      </div>
    </header>
  );
} 