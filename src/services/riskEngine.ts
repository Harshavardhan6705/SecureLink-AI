import {
  RiskFactor,
  RiskLevel,
  SecurityCheckItem,
  UrlDetails,
} from '../types/scanner';

export interface EvaluatedRisk {
  score: number;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  checks: SecurityCheckItem[];
  recommendations: string[];
}

export function evaluateUrlRisk(details: UrlDetails): EvaluatedRisk {
  const factors: RiskFactor[] = [];
  const checks: SecurityCheckItem[] = [];
  const recommendations: string[] = [];

  let totalScore = 0;

  // 1. PROTOCOL CHECK
  if (details.hasScriptScheme) {
    totalScore += 45;
    factors.push({
      id: 'script-scheme',
      label: 'Executable/Data Pseudo-Protocol',
      scoreDelta: 45,
      category: 'protocol',
      severity: 'danger',
      reason: 'URL uses javascript:, data:, or vbscript: scheme which can execute code in browsers.',
    });
    checks.push({
      id: 'chk-protocol',
      title: 'Protocol Safety',
      category: 'Protocol',
      status: 'danger',
      description: 'Dangerous executable scheme detected',
      detail: `Protocol is '${details.protocol}'. Legitimate websites use http:// or https://.`,
      weight: 45,
    });
    recommendations.push('Do NOT open this link in any browser; it may attempt client-side script execution.');
  } else if (details.protocol === 'http:') {
    totalScore += 20;
    factors.push({
      id: 'http-insecure',
      label: 'Unencrypted HTTP Protocol',
      scoreDelta: 20,
      category: 'protocol',
      severity: 'warning',
      reason: 'HTTP does not encrypt network traffic, exposing sensitive data to interception.',
    });
    checks.push({
      id: 'chk-protocol',
      title: 'HTTPS Encryption',
      category: 'Protocol',
      status: 'warning',
      description: 'Unencrypted plain HTTP in use',
      detail: 'Traffic is transmitted without SSL/TLS encryption.',
      weight: 20,
    });
    recommendations.push('Avoid submitting passwords, credentials, or credit card info over unencrypted HTTP.');
  } else {
    factors.push({
      id: 'https-secure',
      label: 'HTTPS Encryption Enabled',
      scoreDelta: 0,
      category: 'protocol',
      severity: 'safe',
      reason: 'Standard TLS transport layer encryption is present.',
    });
    checks.push({
      id: 'chk-protocol',
      title: 'HTTPS Encryption',
      category: 'Protocol',
      status: 'passed',
      description: 'Secure TLS connection',
      detail: 'Standard HTTPS encryption protocol is active.',
      weight: 0,
    });
  }

  // 2. IP ADDRESS HOSTNAME CHECK
  if (details.isPrivateIp) {
    totalScore += 35;
    factors.push({
      id: 'private-ip',
      label: 'Private / Intranet IP Address',
      scoreDelta: 35,
      category: 'domain',
      severity: 'danger',
      reason: 'Target points to an internal network or cloud metadata address (potential SSRF).',
    });
    checks.push({
      id: 'chk-ip-host',
      title: 'Domain Resolution',
      category: 'Domain',
      status: 'danger',
      description: 'Private/Intranet IP detected',
      detail: `Hostname ${details.hostname} is reserved for private or link-local networks.`,
      weight: 35,
    });
    recommendations.push('This points to an internal network address (such as localhost or intranet). Confirm you intended to access a local service.');
  } else if (details.isIpAddress) {
    totalScore += 25;
    factors.push({
      id: 'direct-ip',
      label: 'Raw IP Address Used as Hostname',
      scoreDelta: 25,
      category: 'domain',
      severity: 'warning',
      reason: 'Legitimate services typically use registered domain names rather than bare IP addresses.',
    });
    checks.push({
      id: 'chk-ip-host',
      title: 'Domain Resolution',
      category: 'Domain',
      status: 'warning',
      description: 'Direct IP address hostname',
      detail: `URL connects directly to IP ${details.hostname} bypassing domain reputation systems.`,
      weight: 25,
    });
    recommendations.push('Be cautious with raw IP links, which are frequently used to evade domain-level reputation blacklists.');
  } else {
    checks.push({
      id: 'chk-ip-host',
      title: 'Domain Resolution',
      category: 'Domain',
      status: 'passed',
      description: 'Standard Domain Name',
      detail: `Uses registered domain name (${details.domain}).`,
      weight: 0,
    });
  }

  // 3. BRAND IMPERSONATION & TYPOSQUATTING
  if (details.brandImpersonationMatches.length > 0) {
    const brandNames = details.brandImpersonationMatches.join(', ');
    totalScore += 25;
    factors.push({
      id: 'brand-spoof',
      label: `Brand Impersonation (${brandNames})`,
      scoreDelta: 25,
      category: 'domain',
      severity: 'danger',
      reason: `URL contains prominent brand name(s) [${brandNames}] but is not hosted on an official domain.`,
    });
    checks.push({
      id: 'chk-brand-impersonation',
      title: 'Brand Impersonation Check',
      category: 'Domain',
      status: 'danger',
      description: `Possible brand spoofing detected (${brandNames})`,
      detail: `The brand name appears in the URL while the root domain is '${details.domain}'.`,
      weight: 25,
    });
    recommendations.push(`Verify the official website for ${brandNames}. Phishing pages frequently craft look-alike subdomains.`);
  } else {
    checks.push({
      id: 'chk-brand-impersonation',
      title: 'Brand Impersonation Check',
      category: 'Domain',
      status: 'passed',
      description: 'No brand spoofing detected',
      detail: 'No common high-value financial or tech brands were found in subdomains or suspicious contexts.',
      weight: 0,
    });
  }

  // 4. SUSPICIOUS KEYWORDS HEURISTICS
  if (details.suspiciousKeywords.length >= 3) {
    totalScore += 20;
    factors.push({
      id: 'multiple-keywords',
      label: `Multiple Sensitive Keywords (${details.suspiciousKeywords.length})`,
      scoreDelta: 20,
      category: 'keywords',
      severity: 'danger',
      reason: `Heavy concentration of sensitive/urgency terms: ${details.suspiciousKeywords.slice(0, 4).join(', ')}`,
    });
    checks.push({
      id: 'chk-keywords',
      title: 'Keyword Heuristics',
      category: 'Content',
      status: 'danger',
      description: 'High concentration of sensitive keywords',
      detail: `Found: ${details.suspiciousKeywords.join(', ')}`,
      weight: 20,
    });
    recommendations.push('Multiple authentication/urgency keywords detected. Double-check before entering any credentials.');
  } else if (details.suspiciousKeywords.length > 0) {
    totalScore += 10;
    factors.push({
      id: 'suspicious-keywords',
      label: `Sensitive Keywords Detected (${details.suspiciousKeywords.join(', ')})`,
      scoreDelta: 10,
      category: 'keywords',
      severity: 'warning',
      reason: `URL contains keywords commonly seen in credential collection: ${details.suspiciousKeywords.join(', ')}`,
    });
    checks.push({
      id: 'chk-keywords',
      title: 'Keyword Heuristics',
      category: 'Content',
      status: 'warning',
      description: 'Sensitive authentication/urgency keywords present',
      detail: `Matches: ${details.suspiciousKeywords.join(', ')}`,
      weight: 10,
    });
  } else {
    checks.push({
      id: 'chk-keywords',
      title: 'Keyword Heuristics',
      category: 'Content',
      status: 'passed',
      description: 'Clean URL vocabulary',
      detail: 'No sensitive phishing keywords found in hostname or paths.',
      weight: 0,
    });
  }

  // 5. UNUSUAL / HIGH-RISK TLD
  if (details.isHighRiskTld) {
    totalScore += 15;
    factors.push({
      id: 'high-risk-tld',
      label: `High-Risk TLD (.${details.tld})`,
      scoreDelta: 15,
      category: 'domain',
      severity: 'warning',
      reason: `Top-Level Domain (.${details.tld}) has elevated statistical frequency in malicious spam and disposable campaigns.`,
    });
    checks.push({
      id: 'chk-tld',
      title: 'Top-Level Domain (TLD)',
      category: 'Domain',
      status: 'warning',
      description: `Uncommon or high-abuse TLD (.${details.tld})`,
      detail: 'This TLD is frequently observed in low-cost automated phishing campaigns.',
      weight: 15,
    });
  } else {
    checks.push({
      id: 'chk-tld',
      title: 'Top-Level Domain (TLD)',
      category: 'Domain',
      status: 'passed',
      description: `Standard TLD (.${details.tld || 'com'})`,
      detail: 'Domain uses an established top-level domain namespace.',
      weight: 0,
    });
  }

  // 6. URL SHORTENER CHECK
  if (details.isShortened) {
    totalScore += 15;
    factors.push({
      id: 'url-shortener',
      label: `URL Shortener Service (${details.shortenerName || 'Shortener'})`,
      scoreDelta: 15,
      category: 'redirection',
      severity: 'warning',
      reason: 'Shortened URLs mask the true destination domain until followed.',
    });
    checks.push({
      id: 'chk-shortener',
      title: 'Destination Masking',
      category: 'Redirection',
      status: 'warning',
      description: `Link shortener service (${details.shortenerName})`,
      detail: 'The real target server is concealed behind a redirection service.',
      weight: 15,
    });
    recommendations.push('URL shorteners conceal final destinations. Preview or expand shortened links before clicking.');
  } else {
    checks.push({
      id: 'chk-shortener',
      title: 'Destination Masking',
      category: 'Redirection',
      status: 'passed',
      description: 'Direct domain (Not shortened)',
      detail: 'The URL directly addresses the destination server.',
      weight: 0,
    });
  }

  // 7. SUBDOMAIN DEPTH & DOMAIN LENGTH
  if (details.subdomainDepth >= 3) {
    totalScore += 10;
    factors.push({
      id: 'excessive-subdomains',
      label: `Excessive Subdomain Depth (${details.subdomainDepth} levels)`,
      scoreDelta: 10,
      category: 'structure',
      severity: 'warning',
      reason: 'Deep subdomain nesting is often engineered to mimic valid domains or bypass simple filters.',
    });
    checks.push({
      id: 'chk-subdomain',
      title: 'Subdomain Architecture',
      category: 'Structure',
      status: 'warning',
      description: `Excessive subdomain levels (${details.subdomainDepth})`,
      detail: `Subdomain: ${details.subdomain}`,
      weight: 10,
    });
  } else {
    checks.push({
      id: 'chk-subdomain',
      title: 'Subdomain Architecture',
      category: 'Structure',
      status: 'passed',
      description: 'Normal subdomain hierarchy',
      detail: details.subdomain ? `Subdomain: ${details.subdomain}` : 'No nested subdomains',
      weight: 0,
    });
  }

  // 8. OBFUSCATION / SUSPICIOUS CHARACTERS
  if (details.hasAtSymbol) {
    totalScore += 30;
    factors.push({
      id: 'credential-obfuscation',
      label: 'Embedded Credentials / @ Character',
      scoreDelta: 30,
      category: 'obfuscation',
      severity: 'danger',
      reason: 'Using @ in a URL can trick users into reading the prefix as the destination rather than the actual host.',
    });
    checks.push({
      id: 'chk-obfuscation',
      title: 'URL Obfuscation',
      category: 'Obfuscation',
      status: 'danger',
      description: 'Credential masking (@ symbol in URL)',
      detail: 'Browsers treat content before @ as authentication credentials and connect to the host after @.',
      weight: 30,
    });
    recommendations.push('Beware of URLs with "@". What looks like a reputable domain in front may just be bait.');
  } else if (details.hasPunycode) {
    totalScore += 20;
    factors.push({
      id: 'punycode-domain',
      label: 'Punycode / IDN Domain (xn--)',
      scoreDelta: 20,
      category: 'obfuscation',
      severity: 'warning',
      reason: 'Punycode internationalized domain names can be leveraged in visual homograph attacks.',
    });
    checks.push({
      id: 'chk-obfuscation',
      title: 'URL Obfuscation',
      category: 'Obfuscation',
      status: 'warning',
      description: 'Punycode / Internationalized Domain Name',
      detail: `Domain representation: ${details.hostname}`,
      weight: 20,
    });
    recommendations.push('Punycode domains can visually mimic common letters with Cyrillic or Greek homoglyphs.');
  } else if (details.hasObfuscatedChars) {
    totalScore += 15;
    factors.push({
      id: 'percent-encoding-abuse',
      label: 'Unusual Percent-Encoding / Character Escapes',
      scoreDelta: 15,
      category: 'obfuscation',
      severity: 'warning',
      reason: 'Encoded dots, slashes, or double percent escapes found in the URL.',
    });
    checks.push({
      id: 'chk-obfuscation',
      title: 'URL Obfuscation',
      category: 'Obfuscation',
      status: 'warning',
      description: 'Abnormal character encoding patterns',
      detail: 'URL contains escaped structural delimiters or double encoding.',
      weight: 15,
    });
  } else {
    checks.push({
      id: 'chk-obfuscation',
      title: 'URL Obfuscation',
      category: 'Obfuscation',
      status: 'passed',
      description: 'Clean characters and formatting',
      detail: 'No credential masking, suspicious escapes, or Punycode homographs.',
      weight: 0,
    });
  }

  // 9. OPEN REDIRECT / SUSPICIOUS PARAMETERS
  if (details.hasSuspiciousRedirectParam) {
    totalScore += 15;
    factors.push({
      id: 'open-redirect-param',
      label: 'Suspicious External Redirect Parameter',
      scoreDelta: 15,
      category: 'redirection',
      severity: 'warning',
      reason: `Query parameter contains an external URL target (${details.redirectTarget || 'external link'}).`,
    });
    checks.push({
      id: 'chk-redirect-params',
      title: 'Redirection Parameters',
      category: 'Redirection',
      status: 'warning',
      description: 'External redirect target in query parameters',
      detail: `Target parameter: ${details.redirectTarget}`,
      weight: 15,
    });
    recommendations.push('The URL contains a redirection parameter that may bounce your browser to an unverified third party.');
  } else if (details.queryParamCount > 6) {
    totalScore += 10;
    factors.push({
      id: 'excessive-params',
      label: `Excessive Query Parameters (${details.queryParamCount})`,
      scoreDelta: 10,
      category: 'structure',
      severity: 'warning',
      reason: 'High density of parameters often used in tracking beacons or payload delivery.',
    });
    checks.push({
      id: 'chk-redirect-params',
      title: 'Redirection Parameters',
      category: 'Redirection',
      status: 'warning',
      description: 'High parameter density',
      detail: `${details.queryParamCount} parameters detected in query string.`,
      weight: 10,
    });
  } else {
    checks.push({
      id: 'chk-redirect-params',
      title: 'Redirection Parameters',
      category: 'Redirection',
      status: 'passed',
      description: 'No suspicious redirect patterns',
      detail: details.queryParamCount > 0 ? `${details.queryParamCount} standard parameters` : 'No query parameters',
      weight: 0,
    });
  }

  // 10. HYPHEN & NUMERIC RATIO HEURISTICS
  if (details.hyphenCount >= 3) {
    totalScore += 10;
    factors.push({
      id: 'excessive-hyphens',
      label: `Excessive Domain Hyphens (${details.hyphenCount})`,
      scoreDelta: 10,
      category: 'domain',
      severity: 'warning',
      reason: 'Phishing domains frequently chain multiple hyphens to string recognizable words together.',
    });
    checks.push({
      id: 'chk-domain-patterns',
      title: 'Domain Character Patterns',
      category: 'Domain',
      status: 'warning',
      description: `Multiple hyphen delimiters (${details.hyphenCount})`,
      detail: 'Chaining hyphens is common in fraudulent domain registrations.',
      weight: 10,
    });
  } else if (details.numericCharRatio > 0.4 && !details.isIpAddress) {
    totalScore += 10;
    factors.push({
      id: 'numeric-heavy-domain',
      label: 'Digit-Heavy Domain Structure',
      scoreDelta: 10,
      category: 'domain',
      severity: 'warning',
      reason: `${Math.round(details.numericCharRatio * 100)}% of characters in the hostname are numerical digits.`,
    });
    checks.push({
      id: 'chk-domain-patterns',
      title: 'Domain Character Patterns',
      category: 'Domain',
      status: 'warning',
      description: 'Abnormally high digit proportion',
      detail: `${Math.round(details.numericCharRatio * 100)}% numeric characters in domain name.`,
      weight: 10,
    });
  } else {
    checks.push({
      id: 'chk-domain-patterns',
      title: 'Domain Character Patterns',
      category: 'Domain',
      status: 'passed',
      description: 'Natural character distribution',
      detail: 'Balanced alphanumeric composition without excessive hyphens.',
      weight: 0,
    });
  }

  // 11. LENGTH & ENTROPY
  if (details.urlLength > 150) {
    totalScore += 10;
    factors.push({
      id: 'excessive-url-length',
      label: `Excessive URL Length (${details.urlLength} chars)`,
      scoreDelta: 10,
      category: 'structure',
      severity: 'warning',
      reason: 'Very long URLs are frequently used to push suspicious query fragments outside mobile browser address bars.',
    });
    checks.push({
      id: 'chk-length',
      title: 'URL Length & Structure',
      category: 'Structure',
      status: 'warning',
      description: `Unusually long URL (${details.urlLength} chars)`,
      detail: 'Exceeds standard 150-character threshold.',
      weight: 10,
    });
  } else if (details.domainLength > 35) {
    totalScore += 10;
    factors.push({
      id: 'long-domain',
      label: `Abnormally Long Domain Name (${details.domainLength} chars)`,
      scoreDelta: 10,
      category: 'structure',
      severity: 'warning',
      reason: 'Long domains often combine multiple corporate keywords.',
    });
    checks.push({
      id: 'chk-length',
      title: 'URL Length & Structure',
      category: 'Structure',
      status: 'warning',
      description: `Extended domain length (${details.domainLength} chars)`,
      detail: 'Hostname exceeds 35 characters.',
      weight: 10,
    });
  } else {
    checks.push({
      id: 'chk-length',
      title: 'URL Length & Structure',
      category: 'Structure',
      status: 'passed',
      description: 'Standard length & dimensions',
      detail: `Domain: ${details.domainLength} chars · Full URL: ${details.urlLength} chars`,
      weight: 0,
    });
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Risk Level according to project specs:
  // 0–30 = Low Risk
  // 31–60 = Medium Risk
  // 61–80 = High Risk
  // 81–100 = Critical Risk
  let riskLevel: RiskLevel = 'Low';
  if (finalScore >= 81) {
    riskLevel = 'Critical';
  } else if (finalScore >= 61) {
    riskLevel = 'High';
  } else if (finalScore >= 31) {
    riskLevel = 'Medium';
  } else {
    riskLevel = 'Low';
  }

  // Default recommendation if empty
  if (recommendations.length === 0) {
    recommendations.push('URL characteristics adhere to standard safety norms. Always practice general web vigilance.');
  }

  return {
    score: finalScore,
    riskLevel,
    factors,
    checks,
    recommendations,
  };
}
