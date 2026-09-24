import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, AlertCircle, X, Sparkles } from 'lucide-react';
import { validateAndNormalizeUrl } from '../utils/validators';

interface UrlInputProps {
  onScan: (url: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

const SAMPLE_URLS = [
  {
    label: 'Standard HTTPS',
    url: 'https://github.com',
    desc: 'Legitimate encrypted service',
  },
  {
    label: 'Phishing Heuristic',
    url: 'http://paypal-verification-account.security-update.xyz/login?urgent=1',
    desc: 'Spoofed brand & high-risk TLD',
  },
  {
    label: 'Private IP / SSRF',
    url: 'http://192.168.1.1/admin-panel/config',
    desc: 'Direct intranet IP connection',
  },
  {
    label: 'URL Shortener',
    url: 'https://bit.ly/3xSecDemo',
    desc: 'Hidden destination redirector',
  },
  {
    label: 'Open Redirect',
    url: 'https://bank-portal.example.com/auth?redirect=http%3A%2F%2Fexternal-phish.biz',
    desc: 'Unvalidated redirect parameter',
  },
];

export function UrlInput({ onScan, isLoading, initialValue = '' }: UrlInputProps) {
  const [url, setUrl] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const check = validateAndNormalizeUrl(url);
    if (!check.isValid) {
      setValidationError(check.error || 'Please enter a valid URL.');
      return;
    }

    onScan(check.normalizedUrl);
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setValidationError(null);
    onScan(sampleUrl);
  };

  const handleClear = () => {
    setUrl('');
    setValidationError(null);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      <form onSubmit={handleSubmit} className="relative w-full max-w-full">
        <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 sm:p-2 bg-zinc-900/90 border border-zinc-800 focus-within:border-red-500/80 focus-within:ring-2 focus-within:ring-red-500/20 rounded-xl shadow-xl transition-all w-full max-w-full">
          <div className="flex items-center flex-1 px-2.5 sm:px-3 py-1.5 min-w-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 shrink-0 mr-2 sm:mr-3" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="https://example.com/login"
              disabled={isLoading}
              className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 font-mono text-xs sm:text-sm md:text-base focus:outline-none disabled:opacity-50 min-w-0"
              autoFocus
            />
            {url && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors shrink-0 ml-1"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            aria-label="Scan URL"
            className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-label-md font-normal text-white bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg shadow-red-950/60 hover:shadow-red-900/40 shrink-0 font-newsreader"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Analyzing URL...</span>
              </>
            ) : (
              <>
                <span>Scan URL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-2.5 flex items-start gap-2 p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-label-md text-red-300 w-full max-w-full">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="break-words leading-relaxed">{validationError}</span>
          </div>
        )}
      </form>

      {/* Quick Test Samples */}
      <div className="mt-4 sm:mt-5 w-full max-w-full">
        <div className="flex items-center gap-1.5 text-label-md text-zinc-400 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="font-normal font-newsreader">Or try an example URL security profile:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full max-w-full">
          {SAMPLE_URLS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectSample(sample.url)}
              className="text-left p-2.5 sm:p-3 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition-all text-zinc-300 group disabled:opacity-50 min-w-0 flex flex-col justify-between min-h-[66px]"
            >
              <div className="font-normal text-zinc-200 group-hover:text-red-400 transition-colors text-label-md font-newsreader truncate">
                {sample.label}
              </div>
              <div className="text-[12px] text-zinc-400 truncate mt-1 font-newsreader leading-tight">
                {sample.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
