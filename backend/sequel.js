const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.SQL_DATABASE, process.env.SQL_NAME, process.env.SQL_PASSWORD, {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  storage: './dataminer.sqlite'
});

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
  email: Sequelize.STRING,
  external_urls: Sequelize.JSON,
  followers: Sequelize.JSON,
  href: Sequelize.STRING,
  username: Sequelize.STRING,
  images: Sequelize.JSON,
  product: Sequelize.STRING,
  type: Sequelize.STRING,
  uri: Sequelize.STRING,
  access: Sequelize.STRING,
  refresh: Sequelize.STRING
})

const Playlist = sequelize.define('playlist', {
  collaborative: Sequelize.BOOLEAN,
  href: Sequelize.STRING,
  key: Sequelize.STRING,
  name: Sequelize.STRING,
  owner: Sequelize.JSON,
  public: Sequelize.BOOLEAN,
  snapshot_id: Sequelize.STRING,
  tracks_string: Sequelize.STRING,
  tracks_number: Sequelize.INTEGER,
  type: Sequelize.STRING,
  uri: Sequelize.STRING
});

const Song = sequelize.define('song', {
  added: Sequelize.STRING,
  album_type: Sequelize.STRING,
  album_name: Sequelize.STRING,
  album_artist: Sequelize.JSON,
  artists: Sequelize.JSON,
  markets: Sequelize.JSON,
  duration: Sequelize.INTEGER,
  href: Sequelize.STRING,
  key: Sequelize.STRING,
  name: Sequelize.STRING,
  playlist: Sequelize.STRING,
  popularity: Sequelize.INTEGER,
  position: Sequelize.INTEGER,
  track_number: Sequelize.INTEGER,
})

module.exports = {
  sequelize,
  User,
  Playlist,
  Song
}
