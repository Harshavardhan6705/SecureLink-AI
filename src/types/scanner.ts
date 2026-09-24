export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type CheckSeverity = 'safe' | 'info' | 'warning' | 'danger';

export type CheckStatus = 'passed' | 'warning' | 'danger';

export interface RiskFactor {
  id: string;
  label: string;
  scoreDelta: number;
  category: 'protocol' | 'domain' | 'structure' | 'keywords' | 'obfuscation' | 'redirection';
  severity: CheckSeverity;
  reason: string;
}

export interface SecurityCheckItem {
  id: string;
  title: string;
  category: string;
  status: CheckStatus;
  description: string;
  detail?: string;
  weight: number;
}

export interface UrlDetails {
  originalUrl: string;
  normalizedUrl: string;
  protocol: string;
  hostname: string;
  domain: string;
  subdomain: string | null;
  subdomainDepth: number;
  port: string;
  pathname: string;
  search: string;
  queryParams: Record<string, string>;
  queryParamCount: number;
  hash: string;
  domainLength: number;
  urlLength: number;
  tld: string;
  isIpAddress: boolean;
  isIpv6: boolean;
  isPrivateIp: boolean;
  hyphenCount: number;
  numericCharRatio: number;
  hasPunycode: boolean;
  punycodeDecoded?: string;
  hasAtSymbol: boolean;
  isShortened: boolean;
  shortenerName?: string;
  suspiciousKeywords: string[];
  brandImpersonationMatches: string[];
  isHighRiskTld: boolean;
  hasMultipleSlashes: boolean;
  hasSuspiciousRedirectParam: boolean;
  redirectTarget?: string;
  hasObfuscatedChars: boolean;
  hasScriptScheme: boolean;
  entropyScore: number;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  durationMs: number;
  url: string;
  score: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  checks: SecurityCheckItem[];
  details: UrlDetails;
  analysisEngine: string;
  recommendations: string[];
}

export interface ScanHistoryItem {
  id: string;
  url: string;
  domain: string;
  score: number;
  riskLevel: RiskLevel;
  timestamp: number;
}
