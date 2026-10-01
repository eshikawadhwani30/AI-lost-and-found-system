/**
 * Security & Production Hardening Middleware
 * 
 * Provides enterprise-grade defensive measures:
 * 1. HTTP Security Headers (equivalent to Helmet.js)
 * 2. NoSQL Operator Injection Sanitization (preventing MongoDB query tampering)
 * 3. Cross-Site Scripting (XSS) input filtering
 * 4. In-Memory Sliding-Window Rate Limiting (anti-brute-force & anti-DDoS)
 */

// ========================================================
// 1. HTTP Security Headers Middleware
// ========================================================
const securityHeaders = (req, res, next) => {
  // Prevent browsers from MIME-sniffing a response away from the declared content-type
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Guard against Clickjacking by forbidding iframe rendering from foreign origins
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Activate browser Cross-Site Scripting filters
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Enforce HTTPS communication (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Prevent sensitive referrers from leaking to external domains
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Prevent Internet Explorer from executing downloads in the site context
  res.setHeader('X-Download-Options', 'noopen');

  // Restrict Flash / PDF cross-domain access
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  // Content Security Policy (allows self, data URIs for images, and local development ports)
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "img-src 'self' data: blob: http: https:; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' http://localhost:5000 http://localhost:5173 http://127.0.0.1:5000 http://127.0.0.1:5173 https://generativelanguage.googleapis.com;"
  );

  // Remove Express fingerprinting header
  res.removeHeader('X-Powered-By');

  next();
};

// ========================================================
// 2. NoSQL Injection Sanitization Middleware
// ========================================================
/**
 * Recursively inspects request objects (body, query, params)
 * and strips any keys that start with '$' or contain '.'
 * (e.g. preventing { "$gt": "" } authentication bypasses)
 */
const cleanNoSqlPayload = (target) => {
  if (!target || typeof target !== 'object') return target;

  if (Array.isArray(target)) {
    return target.map((item) => cleanNoSqlPayload(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(target)) {
    // Strip keys with MongoDB query operators ($) or dot notation (.)
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[Security Warning] Blocked suspicious NoSQL operator key: '${key}'`);
      continue;
    }

    if (value && typeof value === 'object') {
      sanitized[key] = cleanNoSqlPayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const mongoSanitize = (req, res, next) => {
  if (req.body) req.body = cleanNoSqlPayload(req.body);
  if (req.query) req.query = cleanNoSqlPayload(req.query);
  if (req.params) req.params = cleanNoSqlPayload(req.params);
  next();
};

// ========================================================
// 3. Cross-Site Scripting (XSS) Sanitization Middleware
// ========================================================
/**
 * Strips dangerous HTML script tags and javascript: URIs
 * from string values in request payloads
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip <script> blocks
    .replace(/javascript\s*:/gi, '') // Strip javascript: URIs
    .replace(/on\w+\s*=/gi, ''); // Strip inline event handlers like onload=, onerror=
};

const cleanXssPayload = (target) => {
  if (!target || typeof target !== 'object') return target;

  if (Array.isArray(target)) {
    return target.map((item) => (typeof item === 'string' ? sanitizeString(item) : cleanXssPayload(item)));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(target)) {
    if (typeof value === 'string') {
      cleaned[key] = sanitizeString(value);
    } else if (value && typeof value === 'object') {
      cleaned[key] = cleanXssPayload(value);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

const xssSanitize = (req, res, next) => {
  if (req.body) req.body = cleanXssPayload(req.body);
  if (req.query) req.query = cleanXssPayload(req.query);
  next();
};

// ========================================================
// 4. In-Memory Sliding-Window Rate Limiter
// ========================================================
/**
 * Lightweight, zero-dependency sliding-window IP rate limiter
 * Automatically performs garbage collection to avoid memory leaks.
 */
const createRateLimiter = ({ windowMs, max, message, keyGenerator }) => {
  const ipStore = new Map();

  // Periodic cleanup every 5 minutes to prune expired records
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref(); // .unref() ensures this timer does not prevent process termination

  return (req, res, next) => {
    const key = keyGenerator
      ? keyGenerator(req)
      : req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    
    const now = Date.now();
    let record = ipStore.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipStore.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    // Standard RFC RateLimit headers
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please slow down and try again later.',
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  };
};

// --------------------------------------------------------
// Pre-configured Rate Limiters
// --------------------------------------------------------

// 1. Strict Authentication Limiter: 10 attempts per 15 minutes (Anti-Brute-Force)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
});

// 2. AI Matching Endpoint Limiter: 20 requests per 10 minutes (Anti-Quota-Exhaustion)
const aiLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: 'AI matching rate limit exceeded. Please wait a few minutes before running more neural analyses.',
});

// 3. Global API Limiter: 300 requests per 15 minutes (Anti-DDoS)
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests to the Lost & Found API. Please slow down.',
});

module.exports = {
  securityHeaders,
  mongoSanitize,
  xssSanitize,
  createRateLimiter,
  authLimiter,
  aiLimiter,
  generalLimiter,
};
