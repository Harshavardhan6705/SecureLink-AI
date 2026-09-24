import { Globe, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { ScanResult } from '../types/scanner';
import { RiskScore } from '../components/RiskScore';
import { UrlDetails } from '../components/UrlDetails';
import { SecurityChecks } from '../components/SecurityChecks';
import { RiskBreakdown } from '../components/RiskBreakdown';
import { TechnicalAnalysis } from '../components/TechnicalAnalysis';
import { ExportActions } from '../components/ExportActions';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface ResultsProps {
  scan: ScanResult;
  onNewScan: () => void;
}

export function Results({ scan, onNewScan }: ResultsProps) {
  const formattedDate = new Date(scan.timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-4 sm:space-y-6 overflow-hidden">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onNewScan}
          className="flex items-center gap-1.5 text-label-md text-zinc-400 hover:text-zinc-200 transition-colors py-1 shrink-0 font-newsreader"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Scanner</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 text-label-md text-zinc-500 font-newsreader">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span>{scan.durationMs}ms</span>
          </div>
        </div>
      </div>

      {/* Scanned Target Overview Box */}
      <div className="w-full max-w-full p-3.5 sm:p-5 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2 sm:space-y-3 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Globe className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-label-md uppercase font-newsreader tracking-wider text-zinc-400">
              Scanned Target
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono text-zinc-500 truncate">
            ID: {scan.id}
          </div>
        </div>

        <div 
          className="w-full max-w-full font-mono text-xs sm:text-sm text-zinc-100 font-semibold bg-zinc-950 p-2.5 sm:p-3 rounded-lg border border-zinc-800/80 select-all"
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
          }}
        >
          {scan.url}
        </div>
      </div>

      {/* 1. Risk Score Overview */}
      <RiskScore
        score={scan.score}
        riskLevel={scan.riskLevel}
        analysisEngine={scan.analysisEngine}
      />

      {/* 2. Security Checks Matrix */}
      <SecurityChecks checks={scan.checks} />

      {/* 3. URL Details & Parsing */}
      <UrlDetails details={scan.details} />

      {/* 4. Score Calculation & Contributing Factors */}
      <RiskBreakdown score={scan.score} factors={scan.factors} />

      {/* 5. Expandable Technical Analysis */}
      <TechnicalAnalysis scan={scan} />

      {/* 6. Copy / Export / Rescan Bar */}
      <ExportActions scan={scan} onNewScan={onNewScan} />

      {/* 7. Security Disclaimer */}
      <DisclaimerBanner />

    </div>
  );
}
