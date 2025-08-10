const { AuthorizationCode } = require('simple-oauth2');

const oauth2Client = new AuthorizationCode({
    client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
    },
    auth: {
        tokenHost: 'https://oauth2.googleapis.com',
        authorizePath: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenPath: '/token',
    },
});

module.exports = oauth2Client;
