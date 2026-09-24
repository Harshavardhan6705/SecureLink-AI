import { Shield, Lock, Eye, AlertTriangle, Cpu, Globe } from 'lucide-react';
import { UrlInput } from '../components/UrlInput';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface HomeProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export function Home({ onScan, isLoading }: HomeProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12 md:py-16 space-y-8 sm:space-y-12 overflow-hidden">
      
      {/* Hero Headline & Subtitle */}
      <div className="text-center space-y-4 sm:space-y-6 max-w-full">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-label-md">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>Local URL Intelligence Engine</span>
        </div>

        <h1 className="text-display-lg text-white break-words px-2 font-normal">
          Analyze a URL before you trust it.
        </h1>

        <p className="text-body-md text-zinc-300 max-w-2xl mx-auto break-words px-2">
          Check URLs for common phishing, suspicious-domain, and URL-obfuscation indicators with transparent heuristic telemetry.
        </p>
      </div>

      {/* Prominent URL Input Cockpit */}
      <div className="w-full max-w-3xl mx-auto overflow-hidden">
        <UrlInput onScan={onScan} isLoading={isLoading} />
      </div>

      {/* Heuristic Capabilities Grid */}
      <div className="pt-8 sm:pt-12 border-t border-zinc-800/80 w-full max-w-full">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-normal text-zinc-200 font-newsreader tracking-normal">
            Multi-Layered Heuristic Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-full">
          <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-normal text-zinc-100 text-base sm:text-lg font-newsreader">
              Protocol & Transport Safety
            </h3>
            <p className="text-label-md text-zinc-400 leading-relaxed break-words">
              Detects unencrypted plain HTTP connections, suspicious port numbers, and dangerous pseudo-protocols like javascript: or data:.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="font-normal text-zinc-100 text-base sm:text-lg font-newsreader">
              Brand Spoofing & Phishing
            </h3>
            <p className="text-label-md text-zinc-400 leading-relaxed break-words">
              Flags look-alike brand keywords in subdomains and pathnames attempting to impersonate services like PayPal, Apple, or Google.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-normal text-zinc-100 text-base sm:text-lg font-newsreader">
              Domain & TLD Risk
            </h3>
            <p className="text-label-md text-zinc-400 leading-relaxed break-words">
              Identifies bare IP addresses, private Intranet ranges (SSRF traps), Punycode homographs, and high-abuse top-level domains.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-normal text-zinc-100 text-base sm:text-lg font-newsreader">
              Redirection & Obfuscation
            </h3>
            <p className="text-label-md text-zinc-400 leading-relaxed break-words">
              Spots known link shorteners, unvalidated open-redirect query parameters, embedded credential @ signs, and percent-encoding abuse.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="font-normal text-zinc-100 text-base sm:text-lg font-newsreader">
              Shannon Character Entropy
            </h3>
            <p className="text-label-md text-zinc-400 leading-relaxed break-words">
              Mathematically inspects domain randomness to expose algorithmically generated domains (DGA) and obfuscated strings.
            </p>
          </div>

          <div className="p-4 sm:p-5 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2.5 min-w-0 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-red-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-normal text-zinc-100 text-base sm:text-lg font-newsreader">
              Combined Heuristics Engine
            </h3>
            <p className="text-label-md text-zinc-400 leading-relaxed break-words">
              Scores URLs objectively on a 0–100 scale using multiple correlated indicators rather than arbitrary single keywords.
            </p>
          </div>
        </div>
      </div>

      {/* Security Disclaimer */}
      <DisclaimerBanner />

    </div>
  );
}
