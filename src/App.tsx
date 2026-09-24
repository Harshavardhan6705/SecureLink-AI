/**
 * SecureLink Scanner - Modern URL Security & Phishing Analysis Engine
 */

import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { ScanHistory } from './components/ScanHistory';
import { ScanHistoryItem, ScanResult } from './types/scanner';
import { scanUrl } from './services/urlAnalyzer';
import {
  clearAllScanHistory,
  deleteScanFromHistory,
  loadScanHistory,
  saveScanToHistory,
} from './services/storage';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    const stored = loadScanHistory();
    setHistory(stored);
  }, []);

  const handleScan = async (urlToScan: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // First attempt to query the backend API /api/scan if reachable
      let result: ScanResult;
      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlToScan }),
        });

        if (response.ok) {
          const apiData = await response.json();
          result = {
            id: 'scn_' + Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            durationMs: 320,
            url: apiData.url,
            score: apiData.score,
            riskLevel: apiData.riskLevel,
            factors: apiData.factors,
            checks: apiData.checks,
            details: apiData.details,
            analysisEngine: apiData.analysisEngine || 'Local URL Analysis',
            recommendations: apiData.recommendations || [],
          };
        } else {
          // Fall back to client-side static analysis engine
          result = await scanUrl(urlToScan);
        }
      } catch {
        // Fall back to resilient client-side static analysis engine
        result = await scanUrl(urlToScan);
      }

      setCurrentScan(result);
      const updatedHistory = saveScanToHistory(result);
      setHistory(updatedHistory);
      setIsHistoryOpen(false);

      // Scroll to top of results view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred during URL analysis.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScan = () => {
    setCurrentScan(null);
    setError(null);
    setIsHistoryOpen(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteScanFromHistory(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearAllScanHistory();
    setHistory([]);
  };

  const handleSelectFromHistory = (url: string) => {
    setIsHistoryOpen(false);
    handleScan(url);
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-900/60 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <Navbar
        onNewScan={handleNewScan}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Global Error Banner */}
      {error && (
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4">
          <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-red-950/70 border border-red-800 rounded-xl text-red-200 text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="break-words leading-relaxed">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 text-red-300 hover:text-white rounded transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full pb-12 sm:pb-16 overflow-x-hidden">
        {currentScan ? (
          <Results scan={currentScan} onNewScan={handleNewScan} />
        ) : (
          <Home onScan={handleScan} isLoading={isLoading} />
        )}
      </main>

      {/* History Modal / Drawer Backdrop */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl my-auto">
            <ScanHistory
              history={history}
              onSelectScan={handleSelectFromHistory}
              onDeleteScan={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onClose={() => setIsHistoryOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 sm:py-6 text-center text-xs text-zinc-600 w-full max-w-full overflow-hidden">
        <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <img
              src="/favicon.png"
              alt="SecureLink Scanner"
              className="w-4 h-4 rounded object-contain shrink-0 select-none"
            />
            <span className="font-semibold text-zinc-400">SecureLink Scanner</span>
            <span>·</span>
            <span>Scan • Analyze • Stay Safer</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4 text-zinc-500">
            <span>Client-Safe Inspection</span>
            <span>·</span>
            <span>SSRF Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
