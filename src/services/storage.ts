import { ScanHistoryItem, ScanResult } from '../types/scanner';

const STORAGE_KEY = 'securelink_scan_history_v1';
const MAX_HISTORY_ITEMS = 30;

export function loadScanHistory(): ScanHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveScanToHistory(result: ScanResult): ScanHistoryItem[] {
  try {
    const current = loadScanHistory();
    const newItem: ScanHistoryItem = {
      id: result.id,
      url: result.url,
      domain: result.details.domain || result.details.hostname,
      score: result.score,
      riskLevel: result.riskLevel,
      timestamp: result.timestamp,
    };

    // Filter out duplicates of exact same URL from top
    const filtered = current.filter(item => item.url !== result.url);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteScanFromHistory(id: string): ScanHistoryItem[] {
  try {
    const current = loadScanHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllScanHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function generateTextReport(result: ScanResult): string {
  const dateStr = new Date(result.timestamp).toUTCString();
  const lines: string[] = [
    '====================================================',
    '       SECURELINK SCANNER - URL SECURITY REPORT     ',
    '====================================================',
    `Report ID     : ${result.id}`,
    `Scan Time     : ${dateStr}`,
    `Target URL    : ${result.url}`,
    `Analysis Type : ${result.analysisEngine}`,
    '----------------------------------------------------',
    `RISK SCORE    : ${result.score} / 100`,
    `RISK LEVEL    : ${result.riskLevel.toUpperCase()} RISK`,
    '----------------------------------------------------',
    '',
    '[URL DETAILS]',
    `Protocol       : ${result.details.protocol}`,
    `Hostname       : ${result.details.hostname}`,
    `Domain         : ${result.details.domain}`,
    `Subdomain      : ${result.details.subdomain || 'None'}`,
    `Port           : ${result.details.port || 'Default'}`,
    `Path           : ${result.details.pathname}`,
    `Query Params   : ${result.details.queryParamCount}`,
    `URL Length     : ${result.details.urlLength} characters`,
    `Domain Length  : ${result.details.domainLength} characters`,
    `Direct IP      : ${result.details.isIpAddress ? 'YES' : 'No'}`,
    `Shortened URL  : ${result.details.isShortened ? `YES (${result.details.shortenerName})` : 'No'}`,
    '',
    '[RISK SCORE FACTORS]',
    ...result.factors.map(
      f => `* [${f.scoreDelta >= 0 ? '+' + f.scoreDelta : f.scoreDelta}] ${f.label} - ${f.reason}`
    ),
    '',
    '[SECURITY CHECKS SUMMARY]',
    ...result.checks.map(
      c => `* [${c.status.toUpperCase()}] ${c.title}: ${c.description} (${c.detail})`
    ),
    '',
    '[RECOMMENDATIONS]',
    ...result.recommendations.map(r => `* ${r}`),
    '',
    '----------------------------------------------------',
    'DISCLAIMER:',
    'This scanner provides automated indicators based on URL characteristics.',
    'A low-risk result does not guarantee that a website is safe, and a high-risk',
    'result does not by itself prove that a website is malicious. Do not enter passwords,',
    'payment information, or other sensitive information into a suspicious website.',
    '====================================================',
  ];

  return lines.join('\n');
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
