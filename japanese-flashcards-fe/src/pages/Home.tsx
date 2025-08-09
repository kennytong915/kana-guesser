import { useNavigate } from 'react-router-dom';
import LevelMenu from '../components/LevelMenu';
import type { JLPTLevel } from '../types';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();

  const handleStart = (level: JLPTLevel) => {
    navigate(`/game?level=${level}`);
  };

  return (
    <div className="w-full">
      <section className="relative mx-auto mb-6 mt-2 w-full max-w-5xl overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-r from-neutral-50 to-white px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(600px_circle_at_0%_0%,#00000008,transparent_60%),radial-gradient(800px_circle_at_100%_100%,#00000008,transparent_60%)]" />
        <div className="relative">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">JLPT N5–N1</span>
            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">10 rounds</span>
            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600">20s each</span>
          </div>
          <h1
            className="flex items-center gap-2 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            <span>Learn Japanese Vocabulary with KanaGuesser</span>
          </h1>
          <div className="mt-2 text-sm text-neutral-600">Guess the correct hidden kana in the word.</div>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Pick a level and start. Save tricky words and review recent games anytime.
          </p>
        </div>
      </section>

      <LevelMenu onStart={handleStart} showIntro={false} />

      <footer className="py-8 text-center text-xs text-neutral-500">
        Words sourced from <a className="underline hover:no-underline" href="https://github.com/elzup/jlpt-word-list" target="_blank" rel="noreferrer">elzup/jlpt-word-list</a>
      </footer>
    </div>
  );
} 