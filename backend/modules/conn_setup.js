const { Sequelize } = require('sequelize');

const conn_setup = (credentials, logger) => {
    let sequelize = new Sequelize(credentials.database, credentials.username, credentials.password, {
        host: credentials.host,
        dialect: 'postgres'
    });
    logger.info(`Setup was successful`);
    return sequelize;
};
  
module.exports = { conn_setup };