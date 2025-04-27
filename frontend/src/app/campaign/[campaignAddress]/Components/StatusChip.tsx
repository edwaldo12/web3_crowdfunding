'use client';
type Props = { label: string };

export default function StatusChip({ label }: Props) {
  return (
    <span className="rounded-md bg-slate-600 px-4 py-1 text-sm font-medium text-white">
      Status:&nbsp;{label}
    </span>
  );
}
