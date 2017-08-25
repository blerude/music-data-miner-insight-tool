'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Playlists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      collaborative: {
        type: Sequelize.BOOLEAN
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
      owner: {
        type: Sequelize.JSON
      },
      public: {
        type: Sequelize.BOOLEAN
      },
      snapshot_id: {
        type: Sequelize.STRING
      },
      tracks_string: {
        type: Sequelize.STRING
      },
      tracks_number: {
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING
      },
      uri: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Playlists');
  }
};