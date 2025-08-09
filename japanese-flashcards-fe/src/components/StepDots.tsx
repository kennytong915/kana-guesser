type Props = {
  total: number;
  current: number; // 0-indexed current index
};

export default function StepDots({ total, current }: Props) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Progress: ${current + 1} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i < current;
        const isCurrent = i === current;
        return (
          <span
            key={i}
            className={
              'inline-block h-1.5 w-3 rounded-full transition-colors ' +
              (isCurrent
                ? 'bg-neutral-900'
                : isDone
                ? 'bg-neutral-700'
                : 'bg-neutral-200')
            }
          />
        );
      })}
    </div>
  );
} 