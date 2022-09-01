const read_config = (path, logger, fs) => {
    try {
        logger.info(`Watching for existing config.`);
        fs.accessSync(path, fs.F_OK);
        logger.info(`Config exists.`);
    }
    catch(err){
        logger.info(`Config does not exist. Creating default one...`);
        fs.writeFileSync('config.json', JSON.stringify(config));
        logger.info(`Config created successfully`);
    }
    
    logger.info(`Reading credentials from config`);
    return fs.readFileSync(path, "utf8");
};
  
module.exports = { read_config };