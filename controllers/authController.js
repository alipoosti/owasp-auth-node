const bcrypt = require('bcryptjs'); // ✅ A02 – Secure password hashing
const jwt = require('jsonwebtoken'); // ✅ A02 – Token-based auth
const userStore = require('../models/userStore'); // ⚠️ In-memory; replace with secure DB in production

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

// ✨ Manual input validation to prevent invalid or malformed input
// ✅ A03 – Basic protection against injection-like malformed input
function validateUserInput(username, password) {
  const errors = [];

  if (!username || typeof username !== 'string' || username.length < MIN_USERNAME_LENGTH) {
    errors.push({ field: 'username', message: 'Username must be at least 3 characters' });
  }

  if (!password || typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  return errors;
}

// ✅ Register New User
// ✅ A02 – Uses bcrypt for secure password hashing
// ✅ A07 – Enforces basic password policy
// ✅ A01 – Prevents duplicate usernames
// ✅ A03 – Input validation
exports.register = async (request, reply) => {
  const { username, password } = request.body;

  const errors = validateUserInput(username, password);
  if (errors.length > 0) {
    return reply.status(400).send({ errors });
  }

  if (userStore.getUser(username)) {
    // ✅ A01 – Username collision indicates bad state, return 409 Conflict
    return reply.status(409).send({ error: 'Username already taken' });
  }

  // ✅ Hash password with bcrypt (saltRounds = 10)
  const hashed = await bcrypt.hash(password, 10);
  userStore.addUser({ username, password: hashed });

  // ✅ A09 – Log registration event for audit trail
  request.log.info({ event: 'register', user: username }, 'User registered');
  reply.status(201).send({ message: 'User registered successfully' });
};

// ✅ Authenticate Existing User
// ✅ A07 – Ensures ID validation, password match, and token issuance
// ✅ A02 – Returns signed JWT
exports.login = async (request, reply) => {
  const { username, password } = request.body;

  const errors = validateUserInput(username, password);
  if (errors.length > 0) {
    return reply.status(400).send({ errors });
  }

  const user = userStore.getUser(username);
  if (!user) {
    // ✅ A09 – Log failed attempt (user not found)
    request.log.warn({ event: 'login-fail', user: username }, 'User not found');
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    // ✅ A09 – Log failed attempt (wrong password)
    request.log.warn({ event: 'login-fail', user: username }, 'Wrong password');
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  // ✅ A02 – Issue JWT with configurable expiration
  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  // ✅ A09 – Log successful login
  request.log.info({ event: 'login-success', user: username }, 'User logged in');
  reply.send({ token });
};

// Find or create OAuth user, returns user object with username
exports.findOrCreateOAuthUser = (provider, providerId, profile) => {
  let user = userStore.getOAuthUser(provider, providerId);
  if (user) {
    return user;
  }

  // Create a new username based on provider and providerId
  const username = `${provider}:${providerId}`;

  // Store user in userStore
  userStore.addOAuthUser({ provider, providerId, profile });

  // Return user object with username for JWT issuance
  return { username };
};

// Issue JWT token for a given username
exports.issueJwtToken = (username) => {
  return jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
};
