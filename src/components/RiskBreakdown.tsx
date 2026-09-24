import { BarChart3 } from 'lucide-react';
import { RiskFactor } from '../types/scanner';

interface RiskBreakdownProps {
  score: number;
  factors: RiskFactor[];
}

export function RiskBreakdown({ score, factors }: RiskBreakdownProps) {
  return (
    <div className="w-full max-w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
          <h3 className="font-normal font-newsreader text-zinc-100 text-lg sm:text-xl">
            Score Calculation & Contributing Factors
          </h3>
        </div>
        <div className="font-newsreader text-label-md text-zinc-400">
          Accumulated: <span className="font-medium text-zinc-100">{score}</span> / 100
        </div>
      </div>

      <p className="text-body-md text-zinc-300 leading-relaxed font-newsreader">
        Every URL score is transparently calculated from individual heuristic parameters. Below is the exact penalty and credit distribution:
      </p>

      {/* Progress Bar / Meter */}
      <div className="w-full max-w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-zinc-800 flex">
        <div
          className={`h-full transition-all duration-500 ${
            score >= 81
              ? 'bg-red-500'
              : score >= 61
              ? 'bg-orange-500'
              : score >= 31
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(4, score))}%` }}
        />
      </div>

      {/* Itemized Contributing Factors */}
      <div className="space-y-2 mt-3 sm:mt-4 w-full max-w-full">
        {factors.map((factor) => {
          const isZero = factor.scoreDelta === 0;
          const isHigh = factor.scoreDelta >= 20;

          return (
            <div
              key={factor.id}
              className="flex items-start justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-zinc-950/60 border border-zinc-800/80 rounded-lg text-xs min-w-0 max-w-full overflow-hidden"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-normal font-newsreader text-zinc-100 text-base break-words">
                    {factor.label}
                  </span>
                  <span className="text-[10px] sm:text-label-md uppercase font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded shrink-0">
                    {factor.category}
                  </span>
                </div>
                <p className="text-zinc-300 text-label-md leading-relaxed break-words font-newsreader">
                  {factor.reason}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                    isZero
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : isHigh
                      ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  }`}
                >
                  +{factor.scoreDelta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
