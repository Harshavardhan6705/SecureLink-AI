/**
 * URL Validators and Normalizers
 */

export interface ValidationResult {
  isValid: boolean;
  normalizedUrl: string;
  error?: string;
}

const MAX_URL_LENGTH = 2048;

export function validateAndNormalizeUrl(rawInput: string): ValidationResult {
  if (!rawInput || !rawInput.trim()) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'Please enter a URL to scan.',
    };
  }

  let trimmed = rawInput.trim();

  if (trimmed.length > MAX_URL_LENGTH) {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      error: `URL is too long (${trimmed.length} characters). Maximum allowed is ${MAX_URL_LENGTH}.`,
    };
  }

  // Check for dangerous non-HTTP pseudo-protocols upfront
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return {
      isValid: true, // Mark valid so scanner can analyze and highlight high risk
      normalizedUrl: trimmed,
    };
  }

  // If no scheme is present, default to https:// for standard web analysis
  if (!/^https?:\/\//i.test(trimmed)) {
    // If it starts with "//"
    if (trimmed.startsWith('//')) {
      trimmed = 'https:' + trimmed;
    } else {
      trimmed = 'https://' + trimmed;
    }
  }

  try {
    const parsed = new URL(trimmed);

    // Validate protocol
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: `Unsupported protocol '${parsed.protocol}'. Only http:// and https:// are supported.`,
      };
    }

    // Hostname must be present
    if (!parsed.hostname) {
      return {
        isValid: false,
        normalizedUrl: trimmed,
        error: 'Invalid URL: Hostname or domain could not be resolved.',
      };
    }

    return {
      isValid: true,
      normalizedUrl: parsed.href,
    };
  } catch {
    return {
      isValid: false,
      normalizedUrl: trimmed,
      error: 'Invalid URL format. Please ensure it follows http:// or https:// standard structure.',
    };
  }
}
