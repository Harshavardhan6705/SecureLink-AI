import { UrlDetails } from '../types/scanner';

export const KNOWN_URL_SHORTENERS: Record<string, string> = {
  'bit.ly': 'Bitly',
  'tinyurl.com': 'TinyURL',
  't.co': 'Twitter/X Shortener',
  'is.gd': 'is.gd',
  'buff.ly': 'Buffer',
  'ow.ly': 'Hootsuite Ow.ly',
  'goo.gl': 'Google Shortener (Legacy)',
  'cutt.ly': 'Cuttly',
  'rebrand.ly': 'Rebrandly',
  'shorturl.at': 'ShortURL',
  't.ly': 'T.ly',
  'rb.gy': 'Rebrandly Shortener',
  'v.gd': 'v.gd',
  'trib.al': 'Social Flow',
  'linktr.ee': 'Linktree',
};

export const HIGH_RISK_TLDS = new Set([
  'zip', 'mov', 'top', 'xyz', 'click', 'country', 'loan', 'work', 'stream',
  'gq', 'tk', 'ml', 'cf', 'ga', 'fit', 'surf', 'buzz', 'cam', 'live', 'vip',
  'icu', 'monster', 'rest', 'bar', 'party', 'racing', 'download', 'win',
  'bid', 'faith', 'cricket', 'date', 'accountant', 'review', 'science', 'gdn'
]);

export const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'verification', 'account', 'secure', 'update', 'password',
  'wallet', 'bank', 'payment', 'signin', 'confirm', 'authenticate', 'free',
  'gift', 'winner', 'prize', 'claim', 'bonus', 'urgent', 'validate', 'recover',
  'billing', 'security', 'service', 'oauth', 'token', 'support', 'checkpoint',
  'credential', 'suspension', 'unlock', 'unusual', 'activity', 'identity'
];

export const COMMONLY_SPOOFED_BRANDS = [
  'paypal', 'apple', 'google', 'microsoft', 'netflix', 'chase', 'wellsfargo',
  'bankofamerica', 'coinbase', 'metamask', 'binance', 'amazon', 'facebook',
  'instagram', 'whatsapp', 'telegram', 'steam', 'discord', 'roblox', 'ebay',
  'citibank', 'barclays', 'outlook', 'office365', 'icloud'
];

/**
 * Calculate Shannon Entropy of a string to detect randomness or obfuscation
 */
export function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(3));
}

/**
 * Check if hostname is an IPv4 or IPv6 address (including alternative hex, octal, decimal, and mapped notations)
 */
export function isIpAddress(hostname: string): { isIp: boolean; isIpv6: boolean; isPrivate: boolean } {
  // Strip enclosing brackets if IPv6
  const clean = hostname.replace(/^\[|\]$/g, '').trim().toLowerCase();

  // Check for IPv4-mapped IPv6 addresses like ::ffff:127.0.0.1
  if (clean.startsWith('::ffff:')) {
    const embeddedIpv4 = clean.substring(7);
    const subCheck = isIpAddress(embeddedIpv4);
    return { isIp: true, isIpv6: true, isPrivate: subCheck.isPrivate };
  }

  // IPv6 check
  if (clean.includes(':')) {
    const isPrivate =
      clean === '::1' ||
      clean === '::' ||
      clean.startsWith('fe80:') || // Link-local
      clean.startsWith('fc00:') || // Unique local
      clean.startsWith('fd00:') ||
      clean.startsWith('ff02:');   // Multicast
    return { isIp: true, isIpv6: true, isPrivate };
  }

  // Check for pure integer decimal IP (e.g. 2130706433 = 127.0.0.1)
  if (/^\d{8,10}$/.test(clean)) {
    const num = Number(clean);
    if (!isNaN(num) && num > 0 && num <= 4294967295) {
      const o1 = (num >>> 24) & 255;
      const o2 = (num >>> 16) & 255;
      const isPrivate =
        o1 === 10 ||
        o1 === 127 ||
        (o1 === 172 && o2 >= 16 && o2 <= 31) ||
        (o1 === 192 && o2 === 168) ||
        (o1 === 169 && o2 === 254) ||
        o1 === 0;
      return { isIp: true, isIpv6: false, isPrivate };
    }
  }

  // Standard or alternative IPv4 regex (handles decimal, hex 0x7f, and octal 0177)
  const ipv4Parts = clean.split('.');
  if (ipv4Parts.length === 4) {
    const parsedOctets: number[] = [];
    let isValid = true;

    for (const part of ipv4Parts) {
      let val: number;
      if (/^0x[0-9a-f]+$/i.test(part)) {
        val = parseInt(part, 16);
      } else if (/^0[0-7]+$/.test(part)) {
        val = parseInt(part, 8);
      } else if (/^\d+$/.test(part)) {
        val = parseInt(part, 10);
      } else {
        isValid = false;
        break;
      }

      if (isNaN(val) || val < 0 || val > 255) {
        isValid = false;
        break;
      }
      parsedOctets.push(val);
    }

    if (isValid && parsedOctets.length === 4) {
      const isPrivate =
        parsedOctets[0] === 10 ||
        parsedOctets[0] === 127 || // Loopback
        (parsedOctets[0] === 172 && parsedOctets[1] >= 16 && parsedOctets[1] <= 31) ||
        (parsedOctets[0] === 192 && parsedOctets[1] === 168) ||
        (parsedOctets[0] === 169 && parsedOctets[1] === 254) || // Link-local / Cloud metadata (169.254.169.254)
        parsedOctets[0] === 0;

      return { isIp: true, isIpv6: false, isPrivate };
    }
  }

  return { isIp: false, isIpv6: false, isPrivate: false };
}

/**
 * Parses full URL and extracts all analytical metrics
 */
export function parseUrlDetails(rawUrl: string): UrlDetails {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    // If not standard, fallback to basic construct
    parsed = new URL('http://' + rawUrl.replace(/^\/+/, ''));
  }

  const hostname = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol;
  const port = parsed.port || (protocol === 'https:' ? '443' : protocol === 'http:' ? '80' : '');
  const pathname = parsed.pathname;
  const search = parsed.search;
  const hash = parsed.hash;

  // Extract query parameters
  const queryParams: Record<string, string> = {};
  try {
    parsed.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });
  } catch {
    // ignore
  }
  const queryParamCount = Object.keys(queryParams).length;

  // IP check
  const ipCheck = isIpAddress(hostname);

  // Extract domain parts and TLD
  let domain = hostname;
  let subdomain: string | null = null;
  let subdomainDepth = 0;
  let tld = '';

  if (!ipCheck.isIp) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // Handles simple common ccTLDs like .co.uk, .com.br, etc.
      const secondLevelTlds = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'com.br', 'gov.uk', 'ac.uk', 'org.uk'];
      const lastTwo = parts.slice(-2).join('.');

      if (secondLevelTlds.includes(lastTwo) && parts.length > 2) {
        domain = parts.slice(-3).join('.');
        tld = lastTwo;
        if (parts.length > 3) {
          subdomain = parts.slice(0, -3).join('.');
          subdomainDepth = parts.length - 3;
        }
      } else {
        domain = parts.slice(-2).join('.');
        tld = parts[parts.length - 1];
        if (parts.length > 2) {
          subdomain = parts.slice(0, -2).join('.');
          subdomainDepth = parts.length - 2;
        }
      }
    }
  }

  // Punycode detection
  const hasPunycode = hostname.includes('xn--');
  let punycodeDecoded: string | undefined;
  if (hasPunycode) {
    try {
      // Browsers often decode or we can indicate IDN
      punycodeDecoded = hostname;
    } catch {
      // ignore
    }
  }

  // Shortener check
  const isShortened = Boolean(KNOWN_URL_SHORTENERS[hostname]);
  const shortenerName = KNOWN_URL_SHORTENERS[hostname];

  // Hyphen count in hostname
  const hyphenCount = (hostname.match(/-/g) || []).length;

  // Digit ratio in hostname
  const digits = (hostname.match(/\d/g) || []).length;
  const numericCharRatio = hostname.length > 0 ? Number((digits / hostname.length).toFixed(2)) : 0;

  // Suspicious keywords detected in hostname or path
  const fullTextToScan = `${hostname} ${pathname} ${search}`.toLowerCase();
  const suspiciousKeywords = SUSPICIOUS_KEYWORDS.filter(kw => {
    // Regex matching keyword as word boundary or preceded/followed by hyphen/dot/slash
    const regex = new RegExp(`(^|[.\\-_/=?&])${kw}([.\\-_/=?&]|$)`, 'i');
    return regex.test(fullTextToScan);
  });

  // Check brand impersonation:
  // e.g. "paypal" in subdomain or domain is not the official brand domain
  const brandImpersonationMatches: string[] = [];
  COMMONLY_SPOOFED_BRANDS.forEach(brand => {
    if (fullTextToScan.includes(brand)) {
      // If hostname is NOT exactly brand.com / brand.org / etc.
      const officialPattern = new RegExp(`^${brand}\\.[a-z]{2,}$`, 'i');
      if (!officialPattern.test(domain)) {
        brandImpersonationMatches.push(brand);
      }
    }
  });

  // High risk TLD
  const isHighRiskTld = HIGH_RISK_TLDS.has(tld.toLowerCase());

  // Multiple slashes or @ symbol
  const hasAtSymbol = rawUrl.includes('@');
  const hasMultipleSlashes = /\/{3,}/.test(rawUrl);

  // Suspicious redirect params: ?redirect=, ?url=, ?dest=, ?target=, etc.
  const redirectKeys = ['redirect', 'url', 'dest', 'destination', 'target', 'next', 'link', 'r', 'return', 'callback', 'continue'];
  let hasSuspiciousRedirectParam = false;
  let redirectTarget: string | undefined;

  for (const key of redirectKeys) {
    if (queryParams[key]) {
      const targetVal = queryParams[key];
      if (/^https?:\/\//i.test(targetVal) || targetVal.startsWith('//')) {
        hasSuspiciousRedirectParam = true;
        redirectTarget = targetVal;
        break;
      }
    }
  }

  // URL Obfuscation checks:
  // - percent encoded dots (%2e), percent encoded slashes (%2f), double encoding (%25)
  // - hex or octal IP representations
  const hasObfuscatedChars =
    /%2[eEfF]/.test(rawUrl) ||
    /%25/.test(rawUrl) ||
    hasAtSymbol ||
    /%00/.test(rawUrl);

  // Script or dangerous pseudo-protocols
  const lowerRaw = rawUrl.toLowerCase();
  const hasScriptScheme =
    lowerRaw.startsWith('javascript:') ||
    lowerRaw.startsWith('data:') ||
    lowerRaw.startsWith('vbscript:');

  // Calculate Shannon entropy on hostname and full URL
  const entropyScore = calculateShannonEntropy(hostname);

  return {
    originalUrl: rawUrl,
    normalizedUrl: parsed.href,
    protocol,
    hostname,
    domain,
    subdomain,
    subdomainDepth,
    port,
    pathname: pathname || '/',
    search,
    queryParams,
    queryParamCount,
    hash,
    domainLength: hostname.length,
    urlLength: rawUrl.length,
    tld,
    isIpAddress: ipCheck.isIp,
    isIpv6: ipCheck.isIpv6,
    isPrivateIp: ipCheck.isPrivate,
    hyphenCount,
    numericCharRatio,
    hasPunycode,
    punycodeDecoded,
    hasAtSymbol,
    isShortened,
    shortenerName,
    suspiciousKeywords,
    brandImpersonationMatches,
    isHighRiskTld,
    hasMultipleSlashes,
    hasSuspiciousRedirectParam,
    redirectTarget,
    hasObfuscatedChars,
    hasScriptScheme,
    entropyScore,
  };
}
