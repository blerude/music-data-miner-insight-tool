const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgresql://ben:Ymsd2017@127.0.0.1:5432/mydb')
<<<<<<< HEAD
// const sequelize = new Sequelize('postgres://127.0.0.1:5432/postgres')
=======
>>>>>>> bb1e911a7d3f492e2093243059b541346cdfaa35

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

const Track = sequelize.define('track', {
  added: Sequelize.STRING,
  album_type: Sequelize.STRING,
  album_name: Sequelize.STRING,
  album_name_lower: Sequelize.STRING,
  album_artist: Sequelize.JSON,
  album_artist_lower: Sequelize.JSON,
  artists: Sequelize.JSON,
  artists_lower: Sequelize.ARRAY(Sequelize.STRING),
  href: Sequelize.STRING,
  key: Sequelize.STRING,
  markets: Sequelize.JSON,
  name: Sequelize.STRING,
  name_lower: Sequelize.STRING,
  playlist: Sequelize.STRING,
  popularity: Sequelize.INTEGER,
  prevPop: Sequelize.ARRAY(Sequelize.INTEGER),
  position: Sequelize.INTEGER,
  prevPos: Sequelize.ARRAY(Sequelize.INTEGER)
})

module.exports = {
  sequelize,
  User,
  Playlist,
  Track
}
