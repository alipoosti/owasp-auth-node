// Load environment variables from .env file
// ⚠️ A08:2021 – Ensure the .env file is not exposed publicly or committed to version control
require('dotenv').config();

// Import Fastify and security-related plugins
const Fastify = require('fastify');
const fastifyCookie = require('@fastify/cookie'); // Required for CSRF and sessions
const fastifyCSRF = require('@fastify/csrf-protection'); // ✅ A01, A03, A10
const rateLimit = require('@fastify/rate-limit'); // ✅ A05
const helmet = require('helmet'); // Optional — header-based hardening

// Application routes
const authRoutes = require('./routes/auth'); // 🔐 Implement A01, A07 here
const profileRoutes = require('./routes/profile'); // 🔐 Apply RBAC or ABAC here for A01

// Initialize Fastify server with improved logging
const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname' // ⚠️ Consider logging full context for A09 visibility
      }
    }
  },
  trustProxy: true // ✅ A05 – required when behind reverse proxies (e.g. NGINX)
});

// 🔐 Register cookie plugin (required for CSRF protection)
// ✅ A07 – Session token is signed with secret
fastify.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'keyboardcat',
  parseOptions: {
    // ⚠️ A05 – Make sure to set `secure: true` and `sameSite` in production
  }
});

// 🚫 Rate limiting middleware to prevent brute force and DoS
// ✅ A05, A07 – Blocks abusive clients
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '15 minutes',
  allowList: ['127.0.0.1'],
  ban: 2,
  errorResponseBuilder: function (req, context) {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded: max ${context.max} in ${context.after}`,
    };
  }
});

// 🛡 Manual security headers (simulates Helmet’s protections)
// ✅ A05, A02 – Mitigates clickjacking, MIME sniffing, XSS reflection
fastify.addHook('onRequest', async (req, res) => {
  res.header('X-DNS-Prefetch-Control', 'off');
  res.header('X-Frame-Options', 'SAMEORIGIN');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('Referrer-Policy', 'no-referrer');
  // ⚠️ Consider CSP (Content-Security-Policy) for stronger A03 protection
});

// 🛡 CSRF Protection Middleware
// ✅ A01, A03, A10 – Prevents malicious state-changing requests
fastify.register(fastifyCSRF, {
  cookieKey: '_csrf',
  cookieOpts: {
    path: '/',
    httpOnly: true, // ✅ A02 – Prevents client-side JS access
    sameSite: 'strict', // ✅ A05 – Mitigates CSRF via third-party sites
    secure: false // ⚠️ A02 – Set to true in production (HTTPS only)
  }
});

// 🎫 Endpoint to retrieve CSRF token (used by frontend)
// ✅ A03, A10 – Token is tied to session and origin
fastify.get('/csrf-token', async (request, reply) => {
  try {
    const token = await reply.generateCsrf();
    reply.send({ csrfToken: token });
  } catch (err) {
    request.log.error(err, 'Failed to generate CSRF token');
    reply.status(500).send({ error: 'CSRF token generation failed' });
  }
});

// 🧪 Health check endpoint
// ✅ Useful for uptime monitoring
// ⚠️ A09 – Consider authentication or rate limit to prevent abuse
fastify.get('/ping', async (request, reply) => {
  reply.send({ pong: true, uptime: process.uptime() });
});

// 📦 Register protected routes
// 🔐 These should enforce access control (A01) and sanitize inputs (A03)
fastify.register(authRoutes);
fastify.register(profileRoutes);

// ❌ Global error handler
// ✅ A09 – Logs all uncaught errors for incident detection
fastify.setErrorHandler(function (error, request, reply) {
  request.log.error(error);
  reply.status(500).send({ error: 'Internal Server Error' });
});

// 🚀 Launch server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ✅ Required for containerized environments (Docker, etc.)

fastify.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    fastify.log.error(err); // ✅ A09 – Critical for security forensics
    process.exit(1);
  }
});

module.exports = fastify;