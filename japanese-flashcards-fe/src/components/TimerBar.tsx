type Props = {
  totalMs: number;
  remainingMs: number;
};

export default function TimerBar({ totalMs, remainingMs }: Props) {
  const pct = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
      <div
        className="h-full bg-black transition-[width] duration-100 ease-linear"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
} 