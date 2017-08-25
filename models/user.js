'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    country: DataTypes.STRING,
    display_name: DataTypes.STRING,
    href: DataTypes.STRING,
    username: DataTypes.STRING,
    access: DataTypes.STRING,
    refresh: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};