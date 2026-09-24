import { useState } from 'react';
import { Copy, Check, FileText, FileCode, RotateCcw, Share2 } from 'lucide-react';
import { ScanResult } from '../types/scanner';
import { downloadFile, generateTextReport } from '../services/storage';

interface ExportActionsProps {
  scan: ScanResult;
  onNewScan: () => void;
}

export function ExportActions({ scan, onNewScan }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopySummary = async () => {
    const summary = [
      `SecureLink URL Security Scan`,
      `Target URL: ${scan.url}`,
      `Risk Score: ${scan.score}/100 (${scan.riskLevel} Risk)`,
      `Protocol: ${scan.details.protocol} | Domain: ${scan.details.domain}`,
      `Analysis: ${scan.analysisEngine}`,
      `Timestamp: ${new Date(scan.timestamp).toISOString()}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadTxt = () => {
    const text = generateTextReport(scan);
    const domainSafe = (scan.details.domain || 'report').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(`security-scan-${domainSafe}-${scan.id}.txt`, text, 'text/plain');
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(scan, null, 2);
    const domainSafe = (scan.details.domain || 'report').replace(/[^a-z0-9_-]/gi, '_');
    downloadFile(`security-scan-${domainSafe}-${scan.id}.json`, jsonStr, 'application/json');
  };

  return (
    <div className="w-full max-w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden font-newsreader">
      <div className="flex items-center gap-2">
        <Share2 className="w-4 h-4 text-zinc-400 shrink-0" />
        <span className="text-label-md font-normal text-zinc-300">
          Export & Actions:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={handleCopySummary}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/70 text-label-md font-normal text-zinc-200 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Copy Results</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadTxt}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/70 text-label-md font-normal text-zinc-200 rounded-lg transition-colors"
          title="Download report as plain text"
        >
          <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>Report (.txt)</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadJson}
          className="flex-initial flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700/80 border border-zinc-700/70 text-label-md font-normal text-zinc-200 rounded-lg transition-colors"
          title="Download report as JSON"
        >
          <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>JSON</span>
        </button>

        <button
          type="button"
          onClick={onNewScan}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-label-md font-normal text-white rounded-lg transition-colors shadow-sm shadow-red-950"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>Scan Another URL</span>
        </button>
      </div>
    </div>
  );
}
