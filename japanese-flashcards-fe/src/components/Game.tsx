import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameResult, JLPTLevel, RoundResult, Word } from '../types';
import { fetchWords } from '../lib/api';
import TimerBar from './TimerBar';
import OptionsGrid from './OptionsGrid';
import StepDots from './StepDots';
import { motion, AnimatePresence } from 'framer-motion';

const ROUND_COUNT = 10;
const ROUND_TIME_MS = 20_000;

type Props = {
  level: JLPTLevel;
  onComplete: (result: GameResult) => void;
};

export default function Game({ level, onComplete }: Props) {
  const [words, setWords] = useState<Word[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [remainingMs, setRemainingMs] = useState(ROUND_TIME_MS);
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const startedAtRef = useRef<number>(Date.now());
  const roundStartRef = useRef<number>(Date.now());
  const roundsRef = useRef<RoundResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const w = await fetchWords(level);
        if (cancelled) return;
        const normalized = w.slice(0, ROUND_COUNT).map((word) => (
          level === 'all' ? word : { ...word, level }
        ));
        setWords(normalized);
        startedAtRef.current = Date.now();
        roundStartRef.current = Date.now();
        setRemainingMs(ROUND_TIME_MS);
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || 'Failed to load words');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [level]);

  useEffect(() => {
    if (!words) return;
    if (locked) return; // pause timer while feedback shown
    const interval = setInterval(() => {
      setRemainingMs((ms) => {
        if (ms <= 100) return 0;
        return ms - 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [words, locked]);

  useEffect(() => {
    if (!words) return;
    if (remainingMs <= 0 && !locked) {
      handleAnswer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, words, locked]);

  const current = useMemo(() => (words ? words[currentIdx] : null), [words, currentIdx]);

  function handleAnswer(opt: string | null) {
    if (!current || locked) return;
    const isCorrect = opt === current.correctChar;
    const timeTakenMs = Math.max(0, ROUND_TIME_MS - remainingMs);
  
    setLocked(true);
    setSelected(opt);
  
    const round: RoundResult = { word: current, selectedOption: opt, isCorrect, timeTakenMs };
    roundsRef.current = [...roundsRef.current, round];
    if (isCorrect) setScore((s) => s + 1);
  
    setTimeout(() => {
      const next = currentIdx + 1;
      if (next >= ROUND_COUNT) {
        const result: GameResult = {
          id: `${Date.now()}`,
          startedAt: startedAtRef.current,
          completedAt: Date.now(),
          level,
          score: isCorrect ? score + 1 : score,
          rounds: roundsRef.current,
        };
        onComplete(result);
        return;
      }
      setCurrentIdx(next);
      setSelected(null);
      setLocked(false);
      setRemainingMs(ROUND_TIME_MS);
      roundStartRef.current = Date.now();
  
      // Clear focus after the new question is rendered
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (active && active.blur) active.blur();
      }, 0);
    }, 2500);
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 min-h-[70vh] flex items-center justify-center">
        <div className="card p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!words) {
    return (
      <div className="mx-auto max-w-xl px-4 min-h-[70vh] flex items-center justify-center">
        <div className="card p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
            <div className="text-sm text-neutral-500">Fetching words…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 min-h-[70vh] flex flex-col justify-center">
      <div className="mb-3 flex items-center justify-between text-sm text-neutral-600">
        <span>Level: {level}</span>
        <span>Score: {score} / {ROUND_COUNT}</span>
      </div>
      <TimerBar totalMs={ROUND_TIME_MS} remainingMs={remainingMs} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="card mt-4 p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-neutral-500">Word {currentIdx + 1} / {ROUND_COUNT}</div>
            {level === 'all' && current && (
              <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-600">{current.level}</span>
            )}
          </div>

          <div className="mb-6 space-y-2 text-center">
            <div className="text-lg text-neutral-500">
              <span className="font-mono">{current?.hiddenReading}</span>
            </div>
            <div className="text-sm text-neutral-500">{current?.meaning}</div>
            {locked && (
              <div className="text-2xl font-semibold tracking-tight">
                {current?.expression}
              </div>
            )}
          </div>

          <OptionsGrid
            options={current!.options}
            correct={current!.correctChar}
            selected={selected}
            locked={locked}
            onSelect={(opt) => handleAnswer(opt)}
          />
        </motion.div>
      </AnimatePresence>

      <div className="mx-auto mt-4 flex w-full max-w-xs justify-center">
        <StepDots total={ROUND_COUNT} current={currentIdx} />
      </div>
    </div>
  );
} 