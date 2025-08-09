type Props = {
  label?: string;
};

export default function Spinner({ label }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" aria-hidden />
      {label && <span className="text-sm text-neutral-600">{label}</span>}
    </div>
  );
} 