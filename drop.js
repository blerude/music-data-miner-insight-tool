var Sequelize = require('sequelize')
var { sequelize, User, Playlist, Track } = require('./backend/sequel.js')

setTimeout(() => {
  Playlist.findAll().then(list => {console.log('Playlists: ' + list.length)})
  Track.findAll().then(list => {console.log('Songs: ' + list.length)})
  Playlist.drop()
  Track.drop()
}, 3000)
