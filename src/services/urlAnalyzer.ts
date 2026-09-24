import { ScanResult } from '../types/scanner';
import { parseUrlDetails } from '../utils/urlParser';
import { validateAndNormalizeUrl } from '../utils/validators';
import { evaluateUrlRisk } from './riskEngine';

/**
 * Executes URL scanning and security analysis.
 * Performs safe client-side / local static analysis without blindly executing or loading untrusted external web pages.
 */
export async function scanUrl(inputUrl: string): Promise<ScanResult> {
  const startTime = performance.now();

  const validation = validateAndNormalizeUrl(inputUrl);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid URL provided.');
  }

  const normalized = validation.normalizedUrl;

  // Simulate natural heuristic execution delay (250-400ms) for realistic UX and thorough scanning feel
  await new Promise(resolve => setTimeout(resolve, 350));

  // 1. Parse URL & domain structures
  const details = parseUrlDetails(normalized);

  // 2. Evaluate risk factors & checks
  const evaluated = evaluateUrlRisk(details);

  const durationMs = Math.round(performance.now() - startTime);

  // Generate unique scan ID
  const scanId = 'scn_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);

  const result: ScanResult = {
    id: scanId,
    timestamp: Date.now(),
    durationMs,
    url: normalized,
    score: evaluated.score,
    riskLevel: evaluated.riskLevel,
    factors: evaluated.factors,
    checks: evaluated.checks,
    details,
    analysisEngine: 'Local URL Analysis',
    recommendations: evaluated.recommendations,
  };

  return result;
}
