require('dotenv').config();

module.exports = {
  'credentials': {
    'clientID': process.env.SPOTIFY_CLIENT_ID,
    'clientSecret': process.env.SPOTIFY_CLIENT_SECRET,
    'callbackURL': process.env.SPOTIFY_CALLBACK_URL,
  },
};
