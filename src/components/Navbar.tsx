import { ShieldAlert, ShieldCheck, History, Download } from 'lucide-react';

interface NavbarProps {
  onNewScan: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export function Navbar({ onNewScan, onOpenHistory, historyCount }: NavbarProps) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40 w-full max-w-full">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div 
          onClick={onNewScan}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0 shrink"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-500 group-hover:border-red-500 transition-colors shadow-sm shadow-red-950 shrink-0">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-normal text-zinc-100 font-newsreader tracking-tight text-base sm:text-lg truncate">
                SecureLink
              </span>
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-red-400 bg-red-950/50 border border-red-900/50 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded shrink-0">
                Scanner
              </span>
            </div>
            <p className="text-label-md text-zinc-400 hidden md:block truncate">
              URL Security & Phishing Analysis Engine
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <a
            href="/securelink-scanner.tar.gz"
            download="securelink-scanner.tar.gz"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-label-md text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-md transition-colors shrink-0"
            title="Download full project Git archive (.tar.gz) to push to your GitHub"
          >
            <Download className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="hidden md:inline">Download Git Archive</span>
            <span className="md:hidden">.tar.gz</span>
          </a>

          <button
            type="button"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-label-md text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-md transition-colors shrink-0"
            title="View scan history"
          >
            <History className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="hidden xs:inline sm:inline">History</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-300 rounded text-[10px] sm:text-[11px] font-mono">
                {historyCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onNewScan}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-label-md text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-md transition-colors shrink-0"
            title="Start a new scan"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="hidden xs:inline sm:inline">New Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
