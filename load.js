var axios = require('axios')
var Sequelize = require('sequelize')
var { sequelize, User, Playlist, Song } = require('./backend/sequel.js')


var loadFunction = () => {
  console.log('LOADING...')
  // CLEAR PLAYLIST AND TRACK DATABASE
  // Playlist.drop().then(() => {
  //   Song.drop().then(() => {
  //     // Find the user
  //     User.findOne().then(user => {
  //       axios({
  //         method: 'get',
  //         url: `https://api.spotify.com/v1/users/spotify/playlists`,
  //         headers: {
  //           Authorization: `Bearer ${user.access}`
  //         }
  //       })
  //       .then(response => {
  //         // Begin to extract all Spotify playlists
  //         var offset = 0;
  //         var total = response.data.total
  //         var limit = 50;
  //         // Iterate through all playlists in increments of 50
  //         var promiseArray = [];
  //         while (offset < total) {
  //           promiseArray.push(
  //             axios({
  //               method: 'get',
  //               url: `https://api.spotify.com/v1/users/spotify/playlists?offset=${offset}&limit=${limit}`,
  //               headers: {
  //                 Authorization: `Bearer ${user.access}`
  //               }
  //             })
  //             .catch(err => {
  //               console.log('Error retrieving all playlists', err)
  //             })
  //           )
  //           offset = offset + limit;
  //         }
  //         // Once all playlist groups have been fetched, store each in a database
  //         Promise.all(promiseArray)
  //         .then(promiseResponse => {
  //           console.log('ALL PLAYLISTS HAVE BEEN PULLED', promiseResponse.length)
  //           var playlistPromises = []
  //           promiseResponse.forEach(promise => {
  //             playlistPromises = playlistPromises.concat(promise.data.items.map((item, i) => {
  //               return Playlist.sync()
  //               .then(() => {
  //                 Playlist.create({
  //                   href: item.href,
  //                   key: item.id,
  //                   name: item.name,
  //                   owner: item.owner,
  //                   tracks_string: item.tracks.href,
  //                   tracks_number: item.tracks.total,
  //                   uri: item.uri
  //                 })
  //                 .catch(err => {
  //                   console.log('Error creating playlist', err)
  //                 })
  //               })
  //               .catch(err => {
  //                 console.log('Error syncing item creation', err)
  //               })
  //             }))
  //           })
  //           // Once all the playlists have been stored, store each track
  //           Promise.all(playlistPromises)
  //           .then(playlistResponse => {
  //             console.log('ALL PLAYLISTS HAVE BEEN CREATED', playlistResponse.length)
  //             var totalTracks = 0;
  //             var songPromises = [];
  //             Playlist.findAll().then(items => {
  //               console.log('THE LENGTH IS', items.length)
  //               var ind = 0;
  //               var interval = setInterval(() => {
  //                 if (ind >= items.length) {
  //                   clearInterval(interval);
  //                 } else {
  //                   item = items[ind]
  //                   songSaverLoop(item, ind, user, totalTracks)
  //                   ind = ind + 1;
  //                 }
  //               }, 2000)
  //             })
  //             .catch(err => {
  //               console.log('Error finding all playlists', err)
  //             })
  //           })
  //           .catch(err => {
  //             console.log('Error in playlist storing promise chain', err)
  //           })
  //         })
  //         .catch(err => {
  //           console.log('Error in playlist fetching promise chain', err)
  //         })
  //       })
  //       .catch(err => {
  //         console.log('Error fetching all playlists', err)
  //       })
  //     })
  //     .catch(err => {
  //       console.log('Error finding user', err)
  //     })
  //   })
  // })
}


var songSaverLoop = (item, ind, user, totalTracks) => {
  var offset2 = 0;
  var total2 = item.dataValues.tracks_number;
  var roof = total2 / 100;
  var limit2 = 100;
  var count = 0;
  while (count < roof) {
    var url = item.dataValues.tracks_string + "?offset=" + offset2 + "&limit=" + limit2;
    offset2 = offset2 + 100;

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
            songSaverRequest(item, user, totalTracks, url, count)
            count = count + 1
          })
        }
      });
    } else {
      songSaverRequest(item, user, totalTracks, url, count)
      count = count + 1
    }
  }
}

var songSaverRequest = (item, user, totalTracks, url, count) => {
  axios({
    method: 'get',
    url: url,
    headers: {
      'Authorization': 'Bearer ' + user.access
    }
  })
  .then(response => {
    if (response.data.items) {
      response.data.items.forEach((track, index) => {
        var albumArtists = []
        var albumArtistsLower = []
        track.track.album.artists.forEach(art => {
          albumArtists.push(art.name)
          albumArtistsLower.push(art.name.toLowerCase())
        })
        var markets = []
        track.track.available_markets.forEach(mark => {
          markets.push(mark)
        })
        var artists = []
        var artistsLower = []
        track.track.artists.forEach(art => {
          artists.push(art.name)
          artistsLower.push(art.name.toLowerCase())
        })
        var pos = (count * 100) + index + 1
        totalTracks = totalTracks + 1
        Song.sync()
        .then(() => {
          Song.create({
            added: track.added_at,
            album_type: track.track.album.album_type,
            album_name: track.track.album.name,
            album_name_lower: track.track.album.name.toLowerCase(),
            album_artist: albumArtists,
            album_artist_lower: albumArtistsLower,
            artists: artists,
            artists_lower: artistsLower,
            markets: markets,
            href: track.track.href,
            key: track.track.id,
            name: track.track.name,
            name_lower: track.track.name.toLowerCase(),
            popularity: track.track.popularity,
            track_number: track.track.track_number,
            playlist: item.dataValues.key,
            position: pos
          })
          .catch(err => {
            console.log('Error creating track', err)
          })
        })
        .catch(err => {
          console.log('Error syncing track', err)
        })
      })
    } else {
      console.log('No total')
    }
  })
  .catch(err => {
    console.log('Error getting tracks', err)
  })
}


// CALL FUNCTION
loadFunction()
