const authController = require('../controllers/authController');
const { URL } = require('url');
const oauth2Client = require('../lib/oauthClient'); // Import oauth2Client instance

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

  // 🔐 OAuth2 Google login redirect
  fastify.get('/api/auth/oauth/google', async (request, reply) => {
    const redirectUri = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    redirectUri.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
    redirectUri.searchParams.set('redirect_uri', process.env.GOOGLE_CALLBACK_URL);
    redirectUri.searchParams.set('response_type', 'code');
    redirectUri.searchParams.set('scope', 'openid email profile');
    redirectUri.searchParams.set('access_type', 'offline');
    redirectUri.searchParams.set('prompt', 'consent');

    reply.redirect(redirectUri.toString());
  });

  // 🔐 OAuth2 Google callback endpoint
  fastify.get('/api/auth/oauth/google/callback', async (request, reply) => {
    const code = request.query.code;
    if (!code) {
      return reply.status(400).send({ error: 'Missing authorization code' });
    }

    try {
      const tokenParams = {
        code,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        scope: 'openid email profile',
      };

      const accessToken = await oauth2Client.getToken(tokenParams);

      // Decode ID token to get user info
      const idToken = accessToken.token.id_token;
      const base64Payload = idToken.split('.')[1];
      const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
      const userInfo = JSON.parse(payload);

      // Check if user exists or create new OAuth user
      let user = authController.findOrCreateOAuthUser('google', userInfo.sub, userInfo);

      // Issue JWT for session
      const jwtToken = authController.issueJwtToken(user.username);

      // Redirect to frontend OAuth callback with token in query param
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
      reply.redirect(`${frontendUrl}/oauth/callback?token=${jwtToken}`);
    } catch (err) {
      request.log.error(err, 'OAuth2 token exchange failed');
      reply.status(500).send({ error: 'OAuth2 token exchange failed' });
    }
  });
}

module.exports = authRoutes;
