const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const api = require('./backend/routes');

var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var client_id = process.env.SPOTIFY_ID; // Your client id
var client_secret = process.env.SPOTIFY_SECRET; // Your secret
var redirect_uri = 'http://localhost:'+PORT+'/callback'; // Your redirect uri

var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var localStorage = require('localStorage')

// var User = require('./models.js').User
var axios = require('axios')

var Sequelize = require('sequelize')
var { sequelize, User, Playlist, Song } = require('./backend/sequel.js')

var mongoose = require('mongoose');
mongoose.connection.on('connected', function() {
  console.log('Connected to MongoDB!');
});
mongoose.connect(process.env.MONGODB_URI);

var crypto = require('crypto');
function hashPassword(password) {
  var hash = crypto.createHash('bel3');
  hash.update(password);
  return hash.digest('hex');
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'))
.use(cookieParser());

app.use(session({
  secret: process.env.SECRET,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

passport.use(new LocalStrategy(
  function(username, password, done) {
    var hashedPassword = hashPassword(password);
    User.findOne({username: username}, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Invalid Username.'});
      if (user.password !== hashedPassword) return done(null, false, { message: 'Wrong Password.'});
      return done(null, user);
    })
  })
)

passport.serializeUser(function(user, done) {
  done(null, user._id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    if (err) {
      console.log('Error deserializing', err);
    } else {
      done(null, user);
    }
  })
})

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (request, response) => {
  response.sendFile(__dirname + 'public/index.html'); // For React/Redux
});

app.use('/api', api);

/**
* Generates a random string containing numbers and letters
* @param  {number} length The length of the string
* @return {string} The generated string
*/
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.get('/load', function(req, res) {

})

app.get('/login', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
  querystring.stringify({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state
  }));
});

app.get('/callback', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
    querystring.stringify({
      error: 'state_mismatch'
    }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
        refresh_token = body.refresh_token;
        console.log('access', access_token)
        console.log('refresh', refresh_token)

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // we can also pass the token to the browser to make requests from there
          User.sync().then(() => {
            User.findOne({
              where: {
                username: body.id
              }})
              .then(user => {
                if (!user) {
                  console.log('Creating...')
                  User.sync().
                  then(() => User.create({
                    country: body.country,
                    display_name: body.display_name,
                    email: body.email,
                    external_urls: body.external_urls,
                    followers: body.followers,
                    href: body.href,
                    username: body.id,
                    images: body.images,
                    product: body.product,
                    type: body.type,
                    uri: body.uri,
                    access: access_token,
                    refresh: refresh_token
                  }))
                  .catch(err => {
                    console.log('Error creating a user', err)
                  })
                } else {
                  console.log('Updating...')
                  user.access = access_token;
                  user.refresh = refresh_token;
                  user.save()
                }
              })
              .catch(err => {
                console.log('Error checking if user already exists', err)
              })
            })

            res.redirect("/#/panel/" + body.id)
          });
        } else {
          res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
        }
      });
    }
  });

  app.get('/refresh_token', function(req, res) {
    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.send({
          'access_token': access_token
        });
      }
    });
  });

  app.post('/retrieve', (req, res) => {
    console.log("RETRIEVE")
    var artist;
    var song;
    var album;
    for (var key in req.body.search) {
      if (key === 'artist') {
        artist = req.body.search[key].toLowerCase()
      } else if (key === 'song') {
        song = req.body.search[key].toLowerCase()
      } else {
        album = req.body.search[key].toLowerCase()
      }
    }
    var promises = [];
    if (album && song) {
      console.log('Searching for an album/artist/song')
      // Extract album/song/artist data
      var goodTracks = []
      Song.findAll().then(tracks => {
        tracks.forEach(track => {
          lowerSong = track.name.toLowerCase();
          lowerAlbum = track.album_name.toLowerCase();
          lowerArtist = [];
          track.album_artist.forEach(artist => {
            lowerArtist.push(artist.toLowerCase())
          })
          if (lowerSong.includes(song) &&
          lowerAlbum.includes(album) &&
          lowerArtist.includes(artist)) {
            goodTracks.push(track)
            var prom = new Promise((resolve, reject) => {
              resolve(Playlist.findOne({
                where: {
                  key: track.playlist
                }
              }))
              reject()
            })
            promises.push(prom)
          }
        })
        Promise.all(promises)
        .then(playlists => {
          console.log(playlists.length)
          if (!playlists.length) {
            res.send({
              tracks: [],
              playlists: [],
            })
          } else {
            var lists = []
            playlists.forEach((playlist, i) => {
              var found = false;
              for (var j in lists) {
                if (lists[j].p === playlist.name) {
                  found = true;
                }
              }
              if (!found) {
                var track = goodTracks[i]
                lists.push({p: playlist.name, e: [{n: "Album: " + track.album_name + " /// Song: " + track.name, pos: track.position}]})
              }
            })
            res.send({
              tracks: [],
              playlists: lists,
            })
          }
        })
        .catch(err => {
          console.log('Error finding playlist', err)
        })
      })
      .catch(err => {
        console.log('Error getting album/artist', err)
      })
    } else if (album) {
      console.log('Searching for an album/artist')
      // Extract album/artist data
      var goodTracks = []
      Song.findAll().then(tracks => {
        tracks.forEach(track => {
          lowerAlbum = track.album_name.toLowerCase();
          lowerArtist = [];
          track.album_artist.forEach(artist => {
            lowerArtist.push(artist.toLowerCase())
          })
          if (lowerAlbum.includes(album) &&
          lowerArtist.includes(artist)) {
            goodTracks.push(track)
            var prom = new Promise((resolve, reject) => {
              resolve(Playlist.findOne({
                where: {
                  key: track.playlist
                }
              }))
              reject()
            })
            promises.push(prom)
          }
        })
        Promise.all(promises)
        .then(playlists => {
          if (!playlists.length) {
            res.send({
              tracks: [],
              playlists: [],
            })
          } else {
            var hits = []
            var lists = []
            playlists.forEach((playlist, i) => {
              var track = goodTracks[i]
              var hitFound = false;
              for (var i in hits) {
                if (track.name === hits[i].t) {
                  var cFound = false;
                  for (var j in hits[i].c) {
                    if (hits[i].c[j].n === playlist.name && hits[i].c[j].pos === track.position) {
                      cFound = true;
                    }
                  }
                  if (!cFound) {
                    hits[i].c.push({n: playlist.name, pos: track.position})
                  }
                  hitFound = true;
                }
              }
              if (!hitFound) {
                hits.push({t: track.name, c: [{n: playlist.name, pos: track.position}]})
              }

              var listFound = false;
              for (var i in lists) {
                if (playlist.name === lists[i].p) {
                  var eFound = false;
                  for (var j in lists[i].e) {
                    if (lists[i].e[j].n === track.name && lists[i].e[j].pos === track.position) {
                      eFound = true;
                    }
                  }
                  if (!eFound) {
                    lists[i].e.push({n: track.name, pos: track.position})
                  }
                  listFound = true;
                }
              }
              if (!listFound) {
                lists.push({p: playlist.name, e: [{n: track.name, pos: track.position}]})
              }
            })
            var finalHits = hits.filter(function(item, pos) {
              return hits.indexOf(item) == pos;
            })
            var finalHits = finalHits.sort(function(a, b) {
              return b.c.length - a.c.length
            })
            var finalPlaylists = lists.filter(function(item, pos) {
              return lists.indexOf(item) == pos;
            })
            var finalPlaylists = finalPlaylists.sort(function(a, b) {
              return b.e.length - a.e.length
            })
            res.send({
              tracks: finalHits,
              playlists: finalPlaylists,
            })
          }
        })
        .catch(err => {
          console.log('Error finding playlist', err)
        })
      })
      .catch(err => {
        console.log('Error getting album/artist', err)
      })
    } else if (song) {
      console.log('Searching for a song/artist')
      // Extract song/artist data
      var goodTracks = []
      Song.findAll().then(tracks => {
        tracks.forEach(track => {
          lowerSong = track.name.toLowerCase();
          lowerArtist = [];
          track.artists.forEach(artist => {
            lowerArtist.push(artist.toLowerCase())
          })
          if (lowerSong.includes(song) &&
          lowerArtist.includes(artist)) {
            goodTracks.push(track)
            var prom = new Promise((resolve, reject) => {
              resolve(Playlist.findOne({
                where: {
                  key: track.playlist
                }
              }))
              reject()
            })
            promises.push(prom)
          }
        })
        Promise.all(promises)
        .then(playlists => {
          if (!playlists.length) {
            res.send({
              tracks: [],
              playlists: [],
            })
          } else {
            var lists = []
            playlists.forEach((playlist, i) => {
              var track = goodTracks[i]
              var listFound = false;
              for (var i in lists) {
                if (playlist.name === lists[i].p) {
                  var eFound = false;
                  for (var j in lists[i].e) {
                    var thread = "Album: " + track.album_name + " /// Song: " + track.name
                    if (lists[i].e[j].n === thread && lists[i].e[j].pos === track.position) {
                      eFound = true;
                    }
                  }
                  if (!eFound) {
                    lists[i].e.push({n: thread, pos: track.position})
                  }
                  listFound = true;
                }
              }
              if (!listFound) {
                var note = "Album: " + track.album_name + " /// Song: " + track.name
                lists.push({p: playlist.name, e: [{n: note, pos: track.position}]})
              }
            })
            var finalPlaylists = lists.filter(function(item, pos) {
              return lists.indexOf(item) == pos;
            })
            var finalPlaylists = finalPlaylists.sort(function(a, b) {
              return b.e.length - a.e.length

            })
            res.send({
              tracks: [],
              playlists: finalPlaylists,
            })
          }
        })
        .catch(err => {
          console.log('Error finding playlist', err)
        })
      })
      .catch(err => {
        console.log('Error getting song/artist', err)
      })
    } else {
      console.log('Searching for an artist')
      // Extract artist data
      var goodTracks = []
      Song.findAll().then(tracks => {
        tracks.forEach(track => {
          lowerArtist = [];
          track.artists.forEach(artist => {
            lowerArtist.push(artist.toLowerCase())
          })
          if (lowerArtist.includes(artist)) {
            goodTracks.push(track)
            var prom = new Promise((resolve, reject) => {
              resolve(Playlist.findOne({
                where: {
                  key: track.playlist
                }
              }))
              reject()
            })
            promises.push(prom)
          }
        })
        Promise.all(promises)
        .then(playlists => {
          if (!playlists.length) {
            res.send({
              tracks: [],
              playlists: [],
            })
          } else {
            var hits = []
            var lists = []
            playlists.forEach((playlist, i) => {
              var track = goodTracks[i]
              var hitFound = false;
              for (var i in hits) {
                if (track.name === hits[i].t) {
                  var cFound = false;
                  for (var j in hits[i].c) {
                    if (hits[i].c[j].n === playlist.name && hits[i].c[j].pos === track.position) {
                      cFound = true;
                    }
                  }
                  if (!cFound) {
                    hits[i].c.push({n: playlist.name, pos: track.position})
                  }
                  hitFound = true;
                }
              }
              if (!hitFound) {
                hits.push({t: track.name, c: [{n: playlist.name, pos: track.position}]})
              }

              var listFound = false;
              for (var i in lists) {
                if (playlist.name === lists[i].p) {
                  var eFound = false;
                  for (var j in lists[i].e) {
                    var thread = track.name + " (" + track.artists[0] + "- " + track.album_name + ")"
                    if (lists[i].e[j].n === thread && lists[i].e[j].pos === track.position) {
                      eFound = true;
                    }
                  }
                  if (!eFound) {
                    lists[i].e.push({n: thread, pos: track.position})
                  }
                  listFound = true;
                }
              }
              if (!listFound) {
                var note = track.name + " (" + track.artists[0] + "- " + track.album_name + ")"
                lists.push({p: playlist.name, e: [{n: note, pos: track.position}]})
              }
            })

            var finalHits = hits.filter(function(item, pos) {
              return hits.indexOf(item) == pos;
            })
            var finalHits = finalHits.sort(function(a, b) {
              return b.c.length - a.c.length
            })
            var finalPlaylists = lists.filter(function(item, pos) {
              return lists.indexOf(item) == pos;
            })
            var finalPlaylists = finalPlaylists.sort(function(a, b) {
              return b.e.length - a.e.length
            })
            res.send({
              tracks: finalHits,
              playlists: finalPlaylists,
            })
          }
        })
        .catch(err => {
          console.log('Error finding playlist', err)
        })
      })
      .catch(err => {
        console.log('Error getting artist', err)
      })
    }
  })

  app.get('/getTotal', (req, res) => {
    var totalLists;
    Playlist.findAll().then(lists => {
      totalLists = lists.length
      res.send({
        total: totalLists
      })
    })
  })

  app.listen(PORT, error => {
    error
    ? console.error(error)
    : console.info(`==> 🌎 Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
  });
