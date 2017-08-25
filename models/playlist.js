'use strict';
module.exports = function(sequelize, DataTypes) {
  var Playlist = sequelize.define('Playlist', {
    collaborative: DataTypes.BOOLEAN,
    href: DataTypes.STRING,
    key: DataTypes.STRING,
    name: DataTypes.STRING,
    owner: DataTypes.JSON,
    public: DataTypes.BOOLEAN,
    snapshot_id: DataTypes.STRING,
    tracks_string: DataTypes.STRING,
    tracks_number: DataTypes.INTEGER,
    type: DataTypes.STRING,
    uri: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Playlist;
};