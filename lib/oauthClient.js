const { AuthorizationCode } = require('simple-oauth2');

const oauth2Client = new AuthorizationCode({
  client: {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
  },
  auth: {
    tokenHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
    tokenPath: '/oauth2/v4/token',
  },
});

module.exports = oauth2Client;
