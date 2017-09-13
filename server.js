// Base URL: https://mezzo-radio-api.herokuapp.com/

const express = require('express');
const knex = require('knex');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const base64 = require('base-64');
const passport = require('passport');
require('dotenv').config();
const SpotifyStrategy = require('passport-spotify').Strategy;

const Spotify = require('spotify-web-api-node');
const credentials = require('./config/auth.js').credentials;
const spotifyApi = new Spotify(credentials);

const STATE_KEY = 'spotify_auth_state';
// your application requests authorization
const scopes = ['user-read-private', 'user-read-email'];

/** Generates a random string containing numbers and letters of N characters */
const generateRandomString = N => (Math.random().toString(36)+Array(N).join('0')).slice(2, N+2);

// passport.serializeUser(function(user, done) { done(null, user); });
// passport.deserializeUser(function(obj, done) { done(null, obj); });

let newUser;

// passport.use(
//   new SpotifyStrategy(
//     credentials,
//     (accessToken, refreshToken, profile, done) => {
//       console.log('strategy fn');
//       console.log('profile.id === ', profile);
//       const url = "https://accounts.spotify.com/api/token";
//       const stringToEncode = credentials.clientID + ':' + credentials.clientSecret;
//       const idSecretEncoding = base64.encode(stringToEncode);
//       axios({
//         method: 'get',
//         url,
//         data: {
//           grant_type: 'authorization_code',
//           code: profile,
//           redirect_uri: credentials.callbackURL,
//         },
//         headers: {
//           'Authorization': "Basic " + idSecretEncoding,
//         }
//       }).then(response => {
//         console.log(response);
//       })
//       console.log('accessToken ===', accessToken.query.code);
//       // return done(null, profile);
//       // newUser = {
//       //   spotify_id: profile.id,
//       //   images: JSON.stringify(profile.images),
//       //   email: profile.email,
//       // };
//       //
//       // knex('users').where('spotify_id', newUser.spotify_id).first().then(user => {
//       //   if (user) { // user exists in the user table
//       //     knex('users').update(newUser, '*').where('spotify_id', newUser.spotify_id).then(result => console.lg('result is', result));
//       //     return done(null, newUser);
//       //   } else { // user doesn't exist in the user table yet
//       //     knex('users').insert(newUser, '*').catch(err => console.log('Spotify did not authenticate you'));
//       //     return done(null, newUser);
//       //   }
//       // })
//       // console.log(accessToken);
//     }
//   )
// );

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'cookie_secret',
  store: new RedisStore({host: '127.0.0.1', port: 6379}),
  proxy: true,
  resave: true,
  saveUninitialized: true,
}));

app.get('/auth/spotify', (_, res) => {
  const state = generateRandomString(16);
  res.cookie(STATE_KEY, state);
  res.send(spotifyApi.createAuthorizeURL(scopes, state));
});

/**
 * The /callback endpoint - hit after the user logs in to spotifyApi
 * Verify that the state we put in the cookie matches the state in the query
 * parameter. Then, if all is good, redirect the user to the user page. If all
 * is not good, redirect the user to an error page
 */
app.get('/callback', (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies ? req.cookies[STATE_KEY] : null;
  // first do state validation
  if (state === null || state !== storedState) { res.redirect('/#/error/state mismatch'); }
  else { // if the state is valid, get the authorization code and pass it on to the client
    res.clearCookie(STATE_KEY);
    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code).then(data => {
      const { expires_in, access_token, refresh_token } = data.body;

      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);

      // use the access token to access the Spotify Web API
      spotifyApi.getMe().then(({ body }) => {
        let newUser = body;
        console.log(newUser);
        knex('users').where('spotify_id', newUser.id).first().then(user => {
          user.access_token = access_token;
          user.refresh_token = refresh_token;
          user.authorization_code = code;
          console.log(user);
          console.log('wut');
          let string = encodeURIComponent(JSON.stringify(user));
          res.redirect('localhost:3000/?' + string);
        });
      });

      // we can also pass the token to the browser to make requests from there
      const tokens = encodeURIComponent(JSON.stringify(data.body));
      const url = 'localhost:3000/interface/?' + tokens;
      console.log(url)
      res.redirect(url);
      res.end();
    }).catch(err => {
      res.redirect('localhost:3000/error/invalid token');
    });
  }
});



// app.use(passport.initialize());
// app.use(passport.session());
// app.get(
//   '/auth/spotify',
//   passport.authenticate(
//     'spotify',
//     { scope: ['user-read-email', 'user-read-private'], showDialog: true }
//   ),
//   function(req,res) {}
// );
// app.get(
//   '/callback',
//   passport.authenticate(
//     'spotify',
//     {
//       // successRedirect: '/auth/spotify/success',
//       failureRedirect: '/auth/spotify/failure'
//     }
//   ),
//   function(req, res) {
//     console.log('/callback fn');
//     res.redirect('localhost:3000/');
//   }
// );
// app.get(
//   '/auth/spotify/success',
//   (req, res, next) => {
//     console.log('/success fn');
//     knex('users').where('spotify_id', newUser.spotify_id).first().then(user => {
//       console.log(user);
//       let string = encodeURIComponent(JSON.stringify(user));
//       res.redirect('localhost:3000/?' + string);
//     });
//   }
// );
// app.get('/auth/spotify/failure', (req, res) => { res.json('user is not authenticated yet') });

const port = process.env.PORT || 8888;

app.listen(port, () => { console.log('Listening on port', port) });
