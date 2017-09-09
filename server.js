const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
const credentials = require('./config/auth.js').credentials;
console.log(credentials);

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

let newUser;

passport.use(
  new SpotifyStrategy(
    credentials,
    (accessToken, refreshToken, profile, done) => {
      newUser = {
        spotify_id: profile.id,
        images: JSON.stringify(profile.images),

        email: profile.email,
      };

      knex('users').where('spotify_id', newUser.spotify_id).first().then(user => {
        if (user) { // user exists in the user table
          knex('users').update(newUser, '*').where('spotify_id', newUser.spotify_id).then(result => console.lg('result is', result));
          return done(null, newUser);
        } else { // user doesn't exist in the user table yet
          knex('users').insert(newUser, '*').catch(err => console.log('Spotify did not authenticate you'));
          return done(null, newUser);
        }
      })
    }
  )
);

const app = express();

app.use(cookieParser());
app.use(bodyParser());
app.use(session({ secret: 'cookie_secret' }));
app.use(passport.initialize());
app.use(passport.session());

app.get(
  '/auth/spotify',
  passport.authenticate(
    'spotify',
    { scope: ['user-read-email', 'user-read-private'], showDialog: true }
  ),
  function(req,res) {}
);

app.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { successRedirect: '/auth/spotify/success', failureRedirect: '/auth/spotify/failure' })
);

app.get(
  '/auth/spotify/success',
  (req, res, next) => {
    knex('users').where('spotify_id', newUser.spotify_id).first().then(user => {
      let string = encodeURIComponent(JSON.stringify(result));
      res.redirect('localhost:3000/?' + string);
    });
  }
);

app.get('/auth/spotify/failure', (req, res) => { res.json('user is not authenticated yet') });


app.listen(8888);
