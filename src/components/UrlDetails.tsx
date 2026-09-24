import { useState } from 'react';
import { Copy, Check, Link2 } from 'lucide-react';
import { UrlDetails as IUrlDetails } from '../types/scanner';

interface UrlDetailsProps {
  details: IUrlDetails;
}

export function UrlDetails({ details }: UrlDetailsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(details.normalizedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full max-w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 sm:p-5 space-y-4 overflow-hidden">
      {/* Title & Copy Full URL */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
          <h3 className="font-normal font-newsreader text-zinc-100 text-lg sm:text-xl">
            URL Structure Breakdown
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopyUrl}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-label-md text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700/80 rounded-md transition-colors shrink-0 font-newsreader"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 shrink-0" />
              <span>Copy URL</span>
            </>
          )}
        </button>
      </div>

      {/* Target URL Raw Display */}
      <div className="w-full max-w-full p-2.5 sm:p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-lg overflow-hidden">
        <div className="text-[10px] sm:text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
          Normalized Target URL
        </div>
        <div 
          className="font-mono text-xs sm:text-sm text-zinc-200 select-all"
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          {details.normalizedUrl}
        </div>
      </div>

      {/* Grid of Parsed URL Properties - fully responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs w-full max-w-full">
        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Protocol</div>
          <div className="font-mono font-medium text-zinc-200 truncate">
            {details.protocol}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Domain</div>
          <div className="font-mono font-medium text-zinc-200 truncate" title={details.domain}>
            {details.domain || details.hostname}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Subdomain</div>
          <div className="font-mono font-medium text-zinc-200 truncate" title={details.subdomain || 'None'}>
            {details.subdomain || 'None'}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Port</div>
          <div className="font-mono font-medium text-zinc-200">
            {details.port || (details.protocol === 'https:' ? '443' : '80')}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0 col-span-1 xs:col-span-2">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Path</div>
          <div className="font-mono font-medium text-zinc-200 truncate" title={details.pathname}>
            {details.pathname || '/'}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Query Params</div>
          <div className="font-mono font-medium text-zinc-200 truncate">
            {details.queryParamCount} param{details.queryParamCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Fragment (Hash)</div>
          <div className="font-mono font-medium text-zinc-200 truncate" title={details.hash || 'None'}>
            {details.hash || 'None'}
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">Domain Length</div>
          <div className="font-mono font-medium text-zinc-200">
            {details.domainLength} chars
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-zinc-950/50 border border-zinc-800/60 rounded-lg min-w-0">
          <div className="text-zinc-500 uppercase font-mono text-[10px] mb-1">URL Length</div>
          <div className="font-mono font-medium text-zinc-200">
            {details.urlLength} chars
          </div>
        </div>
      </div>
    </div>
  );
}
