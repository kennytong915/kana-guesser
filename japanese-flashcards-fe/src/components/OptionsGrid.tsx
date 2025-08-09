type Props = {
  options: string[];
  correct: string;
  selected: string | null;
  locked: boolean;
  onSelect: (opt: string) => void;
};

export default function OptionsGrid({ options, correct, selected, locked, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const isSelected = selected === opt;
        const isCorrect = opt === correct;
        const showCorrect = locked && isCorrect;
        const showWrong = locked && isSelected && !isCorrect;
        return (
          <button
            key={opt}
            type="button"
            tabIndex={-1}
            disabled={locked}
            onClick={() => onSelect(opt)}
            className={
              'option-btn w-full rounded-xl border px-4 py-3 text-lg focus:outline-none ' +
              (locked ? 'transition-none ' : 'transition ') +
              (showCorrect
                ? 'border-green-600 bg-green-50 text-green-700'
                : showWrong
                ? 'border-red-600 bg-red-50 text-red-700'
                : isSelected
                ? 'border-black bg-black text-white'
                : `border-neutral-200 ${locked ? '' : 'active:bg-neutral-100'}`)
            }
            onMouseDown={(e) => e.preventDefault()}
            onFocus={(e) => (e.currentTarget as HTMLButtonElement).blur()}
            onMouseUp={(e) => (e.currentTarget as HTMLButtonElement).blur()}
            onTouchEnd={(e) => (e.currentTarget as HTMLButtonElement).blur()}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
} 