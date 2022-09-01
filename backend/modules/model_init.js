const { DataTypes } = require('sequelize');

const model_init = (sequelize, logger) => {
    Song = sequelize.define(
        'Song',
        {
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        },
        {
            sequelize,
            modelName: 'Song',
        }
    )
    
    Singer = sequelize.define(
        'Singer',
        {
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
        },
        {
            sequelize,
            modelName: 'Singer',
        }
    )
    Singer.hasMany(Song, {onDelete: 'CASCADE'});
    Song.belongsTo(Singer);

    logger.info(`Synchronizing models with database`);
    Song.sync({ alter: true });
    Singer.sync({ alter: true });
    return [Song, Singer];
};
  
module.exports = { model_init };