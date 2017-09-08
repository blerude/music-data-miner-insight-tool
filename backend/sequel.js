const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgresql://ben:Ymsd2017@127.0.0.1:5432/mydb')
// const sequelize = new Sequelize('postgres://127.0.0.1:5432/postgres')

sequelize.authenticate()
.then(() => {
  console.log('CONNECTION: Sequelize connection has been established successfully')
})
.catch(err => {
  console.error('ERROR: Unable to connect to the database:', err);
})

const User = sequelize.define('user', {
  country: Sequelize.STRING,
  display_name: Sequelize.STRING,
  external_urls: Sequelize.JSON,
  followers: Sequelize.JSON,
  href: Sequelize.STRING,
  username: Sequelize.STRING,
  images: Sequelize.JSON,
  product: Sequelize.STRING,
  type: Sequelize.STRING,
  uri: Sequelize.STRING,
  access: Sequelize.STRING,
  refresh: Sequelize.STRING,
  expires: Sequelize.STRING
})

const Playlist = sequelize.define('playlist', {
  href: Sequelize.STRING,
  key: Sequelize.STRING,
  name: Sequelize.STRING,
  owner: Sequelize.JSON,
  tracks_string: Sequelize.STRING,
  tracks_number: Sequelize.INTEGER,
  uri: Sequelize.STRING,
});

const Song = sequelize.define('song', {
  added: Sequelize.STRING,
  album_type: Sequelize.STRING,
  album_name: Sequelize.STRING,
  album_name_lower: Sequelize.STRING,
  album_artist: Sequelize.JSON,
  album_artist_lower: Sequelize.JSON,
  artists: Sequelize.JSON,
  artists_lower: Sequelize.JSON,
  href: Sequelize.STRING,
  key: Sequelize.STRING,
  markets: Sequelize.JSON,
  name: Sequelize.STRING,
  name_lower: Sequelize.STRING,
  playlist: Sequelize.STRING,
  popularity: Sequelize.INTEGER,
  position: Sequelize.INTEGER,
})

module.exports = {
  sequelize,
  User,
  Playlist,
  Song
}
