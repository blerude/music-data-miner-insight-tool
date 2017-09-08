var Sequelize = require('sequelize')
var { sequelize, User, Playlist, Track } = require('./backend/sequel.js')

setTimeout(() => {
  Playlist.drop()
  Track.drop()
}, 3000)
