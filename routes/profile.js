const userStore = require('../models/userStore');
const jwt = require('jsonwebtoken'); // ✅ Used for verifying user identity via JWT

// 🔐 Middleware-like function to validate JWTs before protected route access
async function verifyJWT(request, reply) {
  const authHeader = request.headers.authorization;

  // ✅ A07: Ensure Authorization header is present and follows Bearer schema
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    request.log.warn({ event: 'auth-missing-header' }, 'Missing or malformed Authorization header');
    return reply.status(401).send({ error: 'Unauthorized' }); // 🔐 A01, A07
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ A02: Verify JWT integrity using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded; // ✅ Attach user context
  } catch (err) {
    // ✅ A09: Log failed token verification attempt with cause
    request.log.warn({ event: 'auth-token-invalid', reason: err.name }, 'JWT verification failed');
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

// 🔒 Protected route to get authenticated user's profile
async function profileRoutes(fastify, opts) {
  // ✅ A01: Route protected with verifyJWT → basic access control
  // ⚠️ A04: RBAC/ABAC would improve design further

  fastify.get('/api/profile', { preHandler: verifyJWT }, async (request, reply) => {
    const username = request.user.username;
    const user = userStore.getUser(username);

    if (!user) {
      // ✅ A01: Avoid leaking sensitive info
      request.log.warn({ event: 'profile-user-not-found', user: username }, 'User not found in store');
      return reply.status(404).send({ error: 'User not found' });
    }

    // ✅ A09: Log successful access event (with user context)
    request.log.info({ event: 'profile-access', user: username }, 'Profile retrieved');
    reply.send({ username: user.username });
  });
}

module.exports = profileRoutes;
