const test_conn = async (sequelize, logger) => {
    try {
        logger.info(`Testing connection`);
        await sequelize.authenticate();
        logger.info(`Successfully connected`);
        return true;
    } catch (e) {
        logger.error(`Couldn't connect to database. Error: ${e}`);
        return false;
    }
};
  
module.exports = { test_conn };