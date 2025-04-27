'use client';
type Props = {
  pct: number;
  goalLabel: string;
  raisedLabel: string;
};

export default function ProgressBar({ pct, goalLabel, raisedLabel }: Props) {
  return (
    <section className="mb-10">
      <h2 className="mb-2 text-lg font-semibold text-slate-800">
        Campaign Goal:&nbsp;{goalLabel}
      </h2>

      <div className="relative h-5 w-full overflow-hidden rounded-full bg-slate-800/90">
        {pct > 0 && (
          <div
            className="flex h-full items-center bg-gradient-to-r from-indigo-500 to-blue-500 px-2"
            style={{ width: `${pct}%` }}
          >
            <span className="whitespace-nowrap text-[11px] font-medium leading-none text-white">
              {raisedLabel}
            </span>
          </div>
        )}

        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-medium leading-none text-slate-300">
          {pct.toFixed(0)}%
        </span>
      </div>
    </section>
  );
}
