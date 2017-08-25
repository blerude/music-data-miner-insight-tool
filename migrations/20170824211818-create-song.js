'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Songs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      added: {
        type: Sequelize.STRING
      },
      album_type: {
        type: Sequelize.STRING
      },
      album_name: {
        type: Sequelize.STRING
      },
      album_name_lower: {
        type: Sequelize.STRING
      },
      album_artist: {
        type: Sequelize.STRING
      },
      album_artist_lower: {
        type: Sequelize.STRING
      },
      artists: {
        type: Sequelize.JSON
      },
      artists_lower: {
        type: Sequelize.JSON
      },
      markets: {
        type: Sequelize.JSON
      },
      duration: {
        type: Sequelize.INTEGER
      },
      href: {
        type: Sequelize.STRING
      },
      key: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      name_lower: {
        type: Sequelize.STRING
      },
      playlist: {
        type: Sequelize.STRING
      },
      popularity: {
        type: Sequelize.STRING
      },
      position: {
        type: Sequelize.STRING
      },
      track_number: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Songs');
  }
};