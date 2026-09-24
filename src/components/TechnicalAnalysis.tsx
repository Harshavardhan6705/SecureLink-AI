import { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Binary } from 'lucide-react';
import { ScanResult } from '../types/scanner';

interface TechnicalAnalysisProps {
  scan: ScanResult;
}

export function TechnicalAnalysis({ scan }: TechnicalAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { details } = scan;

  return (
    <div className="w-full max-w-full bg-zinc-900/70 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3.5 sm:p-5 flex items-center justify-between gap-2 hover:bg-zinc-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-normal font-newsreader text-zinc-100 text-lg sm:text-xl truncate">
              Technical Analysis
            </h3>
            <p className="text-label-md text-zinc-400 font-newsreader truncate">
              In-depth RFC 3986 URL parsing, entropy calculations, and heuristic indicators
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-label-md font-newsreader text-zinc-400 shrink-0">
          <span className="hidden xs:inline">{scan.durationMs}ms</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-zinc-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-300" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-3.5 sm:p-5 border-t border-zinc-800 space-y-4 sm:space-y-6 bg-zinc-950/40 text-xs overflow-hidden">
          
          {/* Shannon Entropy & Complexity */}
          <div className="p-3 sm:p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2 sm:space-y-3 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-normal font-newsreader text-base text-zinc-100">
                <Binary className="w-4 h-4 text-red-400 shrink-0" />
                <span>Domain Character Entropy (Shannon Metric)</span>
              </div>
              <span className="font-mono text-zinc-100 font-bold bg-zinc-800 px-2 py-0.5 rounded shrink-0">
                {details.entropyScore} bits/char
              </span>
            </div>
            <p className="text-body-md text-zinc-300 leading-relaxed break-words font-newsreader">
              Shannon entropy measures character randomness. A score between 2.0 and 3.8 is typical for standard human-readable English domain names. High entropy (&gt; 4.0) often indicates algorithmically generated domains (DGA) or obfuscated links.
            </p>
          </div>

          {/* Detailed Indicator Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
            
            {/* Domain Characteristics */}
            <div className="p-3 sm:p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2.5 min-w-0 overflow-hidden">
              <div className="font-semibold text-zinc-200 text-xs pb-1 border-b border-zinc-800 uppercase tracking-wider font-mono">
                Domain Characteristics
              </div>
              <div className="space-y-1.5 text-zinc-300">
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Hostname Type</span>
                  <span className="font-mono truncate">{details.isIpAddress ? 'Direct IP' : 'Registered Domain'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Subdomain Depth</span>
                  <span className="font-mono truncate">{details.subdomainDepth} level(s)</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Domain Length</span>
                  <span className="font-mono">{details.domainLength} chars</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Hyphens</span>
                  <span className="font-mono">{details.hyphenCount}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 min-w-0">
                  <span className="text-zinc-400 shrink-0">Digit Ratio</span>
                  <span className="font-mono">{Math.round(details.numericCharRatio * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Redirection & Obfuscation */}
            <div className="p-3 sm:p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2.5 min-w-0 overflow-hidden">
              <div className="font-semibold text-zinc-200 text-xs pb-1 border-b border-zinc-800 uppercase tracking-wider font-mono">
                Redirection & Obfuscation
              </div>
              <div className="space-y-1.5 text-zinc-300">
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Known Shortener</span>
                  <span className="font-mono truncate max-w-[140px] sm:max-w-none">{details.isShortened ? details.shortenerName : 'None'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Redirect Param</span>
                  <span className="font-mono truncate max-w-[140px] sm:max-w-none">{details.hasSuspiciousRedirectParam ? 'Yes' : 'None'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Credential @</span>
                  <span className="font-mono">{details.hasAtSymbol ? 'Detected' : 'None'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 border-b border-zinc-800/40 min-w-0">
                  <span className="text-zinc-400 shrink-0">Punycode / IDN</span>
                  <span className="font-mono truncate max-w-[140px] sm:max-w-none">{details.hasPunycode ? 'Yes (xn--)' : 'Standard'}</span>
                </div>
                <div className="flex items-center justify-between gap-2 py-1 min-w-0">
                  <span className="text-zinc-400 shrink-0">Query Params</span>
                  <span className="font-mono">{details.queryParamCount}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Actionable Recommendations */}
          <div className="p-3 sm:p-4 bg-zinc-900/80 border border-zinc-800 rounded-lg space-y-2 overflow-hidden">
            <div className="font-semibold text-zinc-200 text-xs uppercase tracking-wider font-mono">
              Analyst Recommendations
            </div>
            <ul className="space-y-1.5 text-zinc-300">
              {scan.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500 font-mono shrink-0">›</span>
                  <span className="break-words leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
