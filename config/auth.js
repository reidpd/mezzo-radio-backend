require('dotenv').config();
const clientID = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const callbackURL = process.env.SPOTIFY_CALLBACK_URL;

const credentials = { clientID, clientSecret, callbackURL, passReqToCallback: true };

module.exports = { credentials };
