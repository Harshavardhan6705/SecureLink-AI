import { useState } from 'react';
import { History, Trash2, ArrowUpRight, Search, X } from 'lucide-react';
import { ScanHistoryItem } from '../types/scanner';

interface ScanHistoryProps {
  history: ScanHistoryItem[];
  onSelectScan: (url: string) => void;
  onDeleteScan: (id: string) => void;
  onClearHistory: () => void;
  onClose?: () => void;
}

export function ScanHistory({
  history,
  onSelectScan,
  onDeleteScan,
  onClearHistory,
  onClose,
}: ScanHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = history.filter((item) => {
    const q = searchTerm.toLowerCase();
    return item.url.toLowerCase().includes(q) || item.domain.toLowerCase().includes(q);
  });

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'text-red-400 bg-red-950/80 border-red-800/80';
      case 'High':
        return 'text-orange-400 bg-orange-950/80 border-orange-800/80';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/80 border-amber-800/80';
      case 'Low':
      default:
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
    }
  };

  return (
    <div className="w-full max-w-full sm:max-w-xl bg-zinc-900/95 border border-zinc-800 rounded-xl p-3.5 sm:p-5 space-y-3 sm:space-y-4 shadow-2xl overflow-hidden font-newsreader">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-zinc-800 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <History className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
          <h3 className="font-normal font-newsreader text-zinc-100 text-lg sm:text-xl truncate">
            Recent Scans
          </h3>
          <span className="text-label-md text-zinc-500 font-mono shrink-0">
            ({history.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-label-md text-zinc-400 hover:text-red-400 flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-800 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Clear</span>
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-200 rounded"
              title="Close history"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input if history has entries */}
      {history.length > 0 && (
        <div className="relative w-full max-w-full">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 absolute left-2.5 sm:left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search recent scans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-label-md text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
        </div>
      )}

      {/* List */}
      {history.length === 0 ? (
        <div className="py-6 sm:py-8 text-center text-zinc-500 text-xs">
          No previous scans in local history. Analyze a URL to save records here.
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-5 sm:py-6 text-center text-zinc-500 text-xs">
          No previous scans match &quot;{searchTerm}&quot;.
        </div>
      ) : (
        <div className="space-y-2 max-h-[340px] sm:max-h-[380px] overflow-y-auto pr-1 w-full max-w-full">
          {filtered.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 bg-zinc-950/60 hover:bg-zinc-800/40 border border-zinc-800/70 rounded-lg group transition-colors min-w-0"
              >
                {/* Clickable URL info */}
                <div
                  onClick={() => onSelectScan(item.url)}
                  className="flex-1 min-w-0 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-medium text-xs text-zinc-200 truncate group-hover:text-red-400 transition-colors block max-w-full">
                      {item.url}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] sm:text-[11px] text-zinc-500 truncate">
                    <span className="truncate">{item.domain}</span>
                    <span>·</span>
                    <span className="shrink-0">{dateStr}</span>
                  </div>
                </div>

                {/* Score badge & delete action */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span
                    className={`text-[10px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded border shrink-0 ${getRiskBadge(
                      item.riskLevel
                    )}`}
                  >
                    {item.score} <span className="hidden xs:inline">{item.riskLevel}</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScan(item.id);
                    }}
                    className="p-1 sm:p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors shrink-0"
                    title="Delete scan record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
