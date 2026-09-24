import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { validateAndNormalizeUrl } from './src/utils/validators.ts';
import { parseUrlDetails, isIpAddress } from './src/utils/urlParser.ts';
import { evaluateUrlRisk } from './src/services/riskEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// Rate Limiter Configuration (In-Memory)
// ==========================================
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

// Periodically clean up expired rate limit entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';

  const now = Date.now();
  let record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
    rateLimitMap.set(clientIp, record);
  } else {
    record.count += 1;
  }

  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - record.count);
  const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

  res.setHeader('RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('RateLimit-Remaining', remaining);
  res.setHeader('RateLimit-Reset', resetSeconds);

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', resetSeconds);
    return res.status(429).json({
      error: 'Too many requests. Please slow down and wait a moment before scanning another URL.',
      retryAfterSeconds: resetSeconds,
    });
  }

  next();
}

// ==========================================
// Server Bootstrap & Security Hardening
// ==========================================
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Disable server fingerprinting
  app.disable('x-powered-by');

  // 2. Enforce HTTP Security Headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self';"
    );
    next();
  });

  // 3. Strict CORS configuration (Prevent unauthorized cross-origin triggering)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const host = req.headers.host;

    if (!origin || (host && origin.includes(host)) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // 4. Request body size limit to prevent memory amplification DoS
  app.use(express.json({ limit: '16kb' }));

  /**
   * SSRF Protection & URL Security Analysis Endpoint
   * POST /api/scan
   */
  app.post('/api/scan', rateLimitMiddleware, (req: Request, res: Response) => {
    // Validate request body structure
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        error: 'Invalid request body. Expected JSON object with a "url" property.',
      });
    }

    const { url } = req.body;

    // Reject missing, non-string, or oversized URLs (DoS mitigation)
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'A valid "url" string is required in the request body.',
      });
    }

    if (url.length > 2048) {
      return res.status(400).json({
        error: 'URL exceeds maximum allowable length of 2048 characters.',
      });
    }

    const validation = validateAndNormalizeUrl(url);
    if (!validation.isValid) {
      return res.status(400).json({
        error: validation.error || 'Invalid URL provided.',
      });
    }

    const normalized = validation.normalizedUrl;

    try {
      const parsedObj = new URL(normalized);
      const ipCheck = isIpAddress(parsedObj.hostname);

      // Check for dangerous internal/private SSRF vectors
      const isInternalHost =
        parsedObj.hostname === 'localhost' ||
        parsedObj.hostname === '127.0.0.1' ||
        parsedObj.hostname === '::1' ||
        parsedObj.hostname === '0.0.0.0' ||
        ipCheck.isPrivate;

      const details = parseUrlDetails(normalized);
      const evaluated = evaluateUrlRisk(details);

      return res.json({
        url: normalized,
        score: evaluated.score,
        riskLevel: evaluated.riskLevel,
        isInternalNetworkTarget: isInternalHost,
        checks: evaluated.checks,
        details,
        factors: evaluated.factors,
        analysisEngine: 'Local URL Analysis',
        recommendations: evaluated.recommendations,
      });
    } catch {
      return res.status(400).json({
        error: 'Failed to parse and analyze the provided URL.',
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Project archive download endpoint for users to download git repo
  app.get(['/download', '/securelink-scanner.tar.gz'], (_req, res) => {
    const archivePath = path.resolve(__dirname, 'securelink-scanner.tar.gz');
    res.download(archivePath, 'securelink-scanner.tar.gz', (err) => {
      if (err) {
        res.status(404).json({ error: 'Archive file not found.' });
      }
    });
  });

  // 5. Mount Vite dev middleware or serve static production build
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // 6. Centralized Error Handling Middleware (prevents stack trace leaks)
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error handled safely:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({
      error: 'An unexpected internal server error occurred.',
    });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
