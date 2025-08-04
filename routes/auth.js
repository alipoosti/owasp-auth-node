const authController = require('../controllers/authController');

async function authRoutes(fastify, opts) {
  // 🔐 Registration Endpoint
  // ✅ A02: Passwords hashed with bcrypt
  // ✅ A03: Input validation included
  // ✅ A07: Enforces authentication structure
  fastify.post('/api/auth/register', authController.register);

  // 🔐 Login Endpoint
  // ✅ A07: Authenticated via bcrypt compare
  // ✅ A02: JWTs issued with expiry
  // ✅ A09: Logging of failed and successful login events
  fastify.post('/api/auth/login', authController.login);
}

module.exports = authRoutes;
