const path = require('path');
const express = require('express');
const app = express();
const PORT = 8080;
// const PORT = 3001;
const api = require('./backend/routes');

var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var client_id = process.env.SPOTIFY_ID; // Your client id
var client_secret = process.env.SPOTIFY_SECRET; // Your secret
var redirect_uri = 'http://45.55.197.135:80/callback'; // Your redirect uri
// var redirect_uri = 'http://localhost:3001/callback'

var bodyParser = require('body-parser');

var axios = require('axios')

var Sequelize = require('sequelize')
var { sequelize, User, Playlist, Track } = require('./backend/sequel.js')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'))
.use(cookieParser());

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
  console.log('LOADING...')
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
        refresh_token = body.refresh_token,
        expires = body.expires_in;
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
                    refresh: refresh_token,
                    expires: new Date().getTime() + (expires * 1000)
		               }))
                  .catch(err => {
                    console.log('Error creating a user', err)
                  })
                } else {
                  console.log('Updating...')
                  user.access = access_token;
                  user.refresh = refresh_token;
                  user.expires = new Date().getTime() + (expires * 1000)
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
      Track.findAll({where: {
        album_name_lower: {
          $like: `%${album}%`
        },
        name_lower: {
          $like: `%${song}%`
        }
      }}).then(tracks => {
        tracks.forEach(track => {
          if (track.name_lower.includes(song) &&
          track.album_name_lower.includes(album) &&
          track.album_artist_lower.includes(artist)) {
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
                lists.push({p: playlist.name, e: [{n: "Album: " + track.album_name + " /// Song: " + track.name, pos: track.position, popu: track.popularity}]})
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
      Track.findAll({where: {
        album_name_lower: {
          $like: `%${album}%`
        }
      }}).then(tracks => {
        tracks.forEach(track => {
          if (track.album_name_lower.includes(album) &&
          track.album_artist_lower.includes(artist)) {
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
                    hits[i].c.push({n: playlist.name, pos: track.position, popu: track.popularity})
                  }
                  hitFound = true;
                }
              }
              if (!hitFound) {
                hits.push({t: track.name, c: [{n: playlist.name, pos: track.position, popu: track.popularity}]})
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
                    lists[i].e.push({n: track.name, pos: track.position, popu: track.popularity})
                  }
                  listFound = true;
                }
              }
              if (!listFound) {
                lists.push({p: playlist.name, e: [{n: track.name, pos: track.position, popu: track.popularity}]})
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
      Track.findAll({where: {
        name_lower: {
          $like: `%${song}%`
        }
      }}).then(tracks => {
        tracks.forEach(track => {
          if (track.name_lower.includes(song) &&
          track.artists_lower.includes(artist)) {
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
                    lists[i].e.push({n: thread, pos: track.position, popu: track.popularity})
                  }
                  listFound = true;
                }
              }
              if (!listFound) {
                var note = "Album: " + track.album_name + " /// Song: " + track.name
                lists.push({p: playlist.name, e: [{n: note, pos: track.position, popu: track.popularity}]})
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
      console.log('ART: ' + `${artist}`)
      var goodTracks = []
      Track.findAll({where: {
        artists_lower: {
          $contains: [`${artist}`]
 	}
      }}).then(tracks => {
        tracks.forEach(track => {
          if (track.artists_lower.includes(artist)) {
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
                    hits[i].c.push({n: playlist.name, pos: track.position, popu: track.popularity})
                  }
                  hitFound = true;
                }
              }
              if (!hitFound) {
                hits.push({t: track.name, c: [{n: playlist.name, pos: track.position, popu: track.popularity}]})
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
                    lists[i].e.push({n: thread, pos: track.position, popu: track.popularity})
                  }
                  listFound = true;
                }
              }
              if (!listFound) {
                var note = track.name + " (" + track.artists[0] + "- " + track.album_name + ")"
                lists.push({p: playlist.name, e: [{n: note, pos: track.position, popu: track.popularity}]})
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
      User.findOne().then(user => {
        if (user.expires < new Date().getTime()) {
          var refresh_token = user.refresh;
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
              user.access = access_token
              user.expires = new Date().getTime() + (body.expires_in * 1000);
              user.save().then(saved => {
                axios({
                  method: 'get',
                  url: `https://api.spotify.com/v1/users/spotify`,
                  headers: {
                    Authorization: `Bearer ${user.access}`
                  }
                })
                .then(resp => {
                  res.send({
                    total: totalLists,
                    followers: resp.data.followers.total
                  })
                })
                .catch(err => {
                  console.log('Error getting spotify user', err)
                })
              })
            }
          });
        } else {
          axios({
            method: 'get',
            url: `https://api.spotify.com/v1/users/spotify`,
            headers: {
              Authorization: `Bearer ${user.access}`
            }
          })
          .then(resp => {
            res.send({
              total: totalLists,
              followers: resp.data.followers.total
            })
          })
          .catch(err => {
            console.log('Error getting spotify user', err)
          })
        }
      })
      .catch(err => {
        console.log('Error finding a user in getTotal', err)
      })
    })
    .catch(err => {
      console.log('Error finding playlists', err)
    })
  })

  app.listen(PORT, 'localhost')
