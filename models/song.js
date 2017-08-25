'use strict';
module.exports = function(sequelize, DataTypes) {
  var Song = sequelize.define('Song', {
    added: DataTypes.STRING,
    album_type: DataTypes.STRING,
    album_name: DataTypes.STRING,
    album_name_lower: DataTypes.STRING,
    album_artist: DataTypes.STRING,
    album_artist_lower: DataTypes.STRING,
    artists: DataTypes.JSON,
    artists_lower: DataTypes.JSON,
    markets: DataTypes.JSON,
    duration: DataTypes.INTEGER,
    href: DataTypes.STRING,
    key: DataTypes.STRING,
    name: DataTypes.STRING,
    name_lower: DataTypes.STRING,
    playlist: DataTypes.STRING,
    popularity: DataTypes.STRING,
    position: DataTypes.STRING,
    track_number: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Song;
};