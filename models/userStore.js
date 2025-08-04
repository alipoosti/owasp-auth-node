// 📦 In-memory user store (Dev-use only!)
// ⚠️ A05: Security Misconfiguration – Data will be lost on restart, no persistence
// ⚠️ A08: Integrity Failures – No data validation, integrity checking, or backup
const users = {};

// ➕ Add user to in-memory store
// ✅ A09: Should be logged externally by caller (e.g., in controller)
exports.addUser = (user) => {
  // 🛑 Defensive check (optional but good for future)
  if (!user || typeof user.username !== 'string') {
    throw new Error('Invalid user object: missing username');
  }

  users[user.username] = user;
};

// 🔍 Retrieve user by username
// ✅ Used in login, profile auth
exports.getUser = (username) => {
  if (!username || typeof username !== 'string') {
    return undefined; // Fail gracefully
  }

  return users[username];
};
