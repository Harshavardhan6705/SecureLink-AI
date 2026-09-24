import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { SecurityCheckItem } from '../types/scanner';

interface SecurityChecksProps {
  checks: SecurityCheckItem[];
}

export function SecurityChecks({ checks }: SecurityChecksProps) {
  const [filter, setFilter] = useState<'all' | 'issues' | 'passed'>('all');

  const issuesCount = checks.filter(c => c.status === 'warning' || c.status === 'danger').length;
  const passedCount = checks.filter(c => c.status === 'passed').length;

  const filteredChecks = checks.filter(c => {
    if (filter === 'issues') return c.status === 'warning' || c.status === 'danger';
    if (filter === 'passed') return c.status === 'passed';
    return true;
  });

  return (
    <div className="w-full max-w-full space-y-3 sm:space-y-4 overflow-hidden">
      {/* Header & Functional Segmented Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300 shrink-0" />
          <h3 className="font-normal font-newsreader text-zinc-100 text-lg sm:text-xl truncate">
            Security Heuristic Checks
          </h3>
          <span className="text-label-md text-zinc-500 font-mono shrink-0">
            ({checks.length})
          </span>
        </div>

        {/* Filter Tabs - flex-wrap and responsive sizing */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg self-start sm:self-auto font-newsreader">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-3 py-1 text-label-md rounded-md transition-colors ${
              filter === 'all'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({checks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('issues')}
            className={`px-2.5 sm:px-3 py-1 text-label-md rounded-md transition-colors ${
              filter === 'issues'
                ? 'bg-red-950/80 text-red-300 border border-red-800/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Issues ({issuesCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('passed')}
            className={`px-2.5 sm:px-3 py-1 text-label-md rounded-md transition-colors ${
              filter === 'passed'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Passed ({passedCount})
          </button>
        </div>
      </div>

      {/* Grid of Security Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-full">
        {filteredChecks.map((item) => {
          const isDanger = item.status === 'danger';
          const isWarning = item.status === 'warning';
          const isPassed = item.status === 'passed';

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all min-w-0 max-w-full overflow-hidden ${
                isDanger
                  ? 'bg-red-950/20 border-red-800/40 hover:border-red-700/60'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60'
                  : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {isDanger && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
                  {isWarning && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
                  {isPassed && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-normal font-newsreader text-base text-zinc-100 truncate">
                      {item.title}
                    </span>
                    <span
                      className={`text-label-md px-2 py-0.5 rounded font-medium shrink-0 ${
                        isDanger
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : isWarning
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                      }`}
                    >
                      {isDanger ? '✕ High Risk' : isWarning ? '⚠ Warning' : '✓ Safe'}
                    </span>
                  </div>

                  <p className="text-label-md text-zinc-300 mt-1 leading-relaxed break-words font-newsreader">
                    {item.description}
                  </p>

                  {item.detail && (
                    <p 
                      className="text-[11px] font-mono text-zinc-500 mt-1.5 select-all"
                      style={{
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
