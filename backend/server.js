const { Op } = require('sequelize');
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const { createLogger, format, transports } = require("winston");

const app = express();
let sequelize, Singer, Song;

const { read_config } = require("./modules/read_config");
const { conn_setup } = require("./modules/conn_setup");
const { test_conn } = require("./modules/test_conn");
const { model_init } = require("./modules/model_init");
const { find_money } = require("./modules/find_money");

const logger = createLogger({
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console({})],
});

logger.info("Adding CORS Headers");
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    next();
});

logger.info("Adding body parser");
app.use(
    express.urlencoded({
      extended: true,
    })
);
app.use(bodyParser.json());

logger.info("Creating default config parameters");
const config = new Object({
    database: "postgres",
    username: "postgres",
    password: "12345",
    host: "localhost",
    port: "5432",
    schema: "postgres"
})

logger.info("Setting default config path");
const path = './config.json';

app.set("view engine", "hbs");

app.get('/', (req, res) => {
    logger.info(`Getting db credentials from config. UserIP: ${req.ip}`);
    let db_credentials = JSON.parse(read_config(path, logger, fs));
    logger.info(`Setting up connection to db. UserIP: ${req.ip}`);
    sequelize = conn_setup(db_credentials, logger);

    logger.info(`Testing connection stable to db. UserIP: ${req.ip}`);
    if (!test_conn(sequelize, logger)){
        logger.error(`Wrong connection to db. UserIP: ${req.ip}`);
        res.send('Неправильные данные для подключения к базе данных');
    }
    else {
        logger.info(`Initializing sequelize models. UserIP: ${req.ip}`);
        [Song, Singer] = model_init(sequelize, logger);
        res.send('Инициализация базы данных успешно выполнена');
    }
});

app.post('/create_song', async (req, res) => {
    logger.info(`Creating new song. UserIP: ${req.ip}`);
    const song = await Song.create({name: req.body.name, SingerId: req.body.SingerId});
    res.send(`Добавлена новая песня под именем ${song.name} исполнителя ${song.SingerId}`);
});

app.get('/read_songs', async (req, res) => {
    let songs_filter = {
        attributes: ['name', 'SingerId'], 
        raw: true, 
        include: { model: Singer, attributes: ['name']},
        where: {}
    }
    if (req.query.SingerId)
        songs_filter.where.SingerId = req.query.SingerId;

    if (req.query.name)
        songs_filter.where.name = {[Op.like]: '%' + req.query.name + '%'};

    if (req.query.createdAt)
        songs_filter.where.createdAt = new Date(req.query.createdAt);
    
    if (req.query.limit)
        songs_filter.limit = req.query.limit;

    if (req.query.offset)
        songs_filter.offset = req.query.offset;

    logger.info(`Getting songs from database. UserIP: ${req.ip}`);
    const songs = await Song.findAll(songs_filter);
    res.send(songs);
});

app.patch('/update_song', async (req, res) => {
    logger.info(`Updating song with id: ${req.body.id}. UserIP: ${req.ip}`);
    await Song.update({
        name: req.body.name, SingerId: req.body.SingerId
    },
    {
        where: {
            id: req.body.id
        }
    });
    res.send(`Обновлена песня`);
});

app.delete('/delete_song', async (req, res) => {
    logger.info(`Deleting song with id: ${req.body.id}. UserIP: ${req.ip}`);
    await Song.destroy({
        where: {
            id: req.body.id
        }
    });
    res.send(`Песня удалена`);
});

app.post('/create_singer', async (req, res) => {
    logger.info(`Creating new singer. UserIP: ${req.ip}`);
    if (find_money(req.body.name)){
        logger.warn(`Trying to create Monetochka. UserIP: ${req.ip}`);
        res.send('Певицу Монеточка никто не любит');
        return
    }
    const singer = await Singer.create(req.body);
    res.send(`Добавлен новый исполнитель под именем ${singer.name}`);
});

app.get('/read_singers', async (req, res) => {
    let singers_filter = {
        attributes: ['id', 'name'],
        raw: true,
        where: {}
    };

    if (req.query.name)
        singers_filter.where.name = {[Op.like]: '%' + req.query.name + '%'};

    if (req.query.createdAt)
        singers_filter.where.createdAt = new Date(req.query.createdAt);
    
    if (req.query.limit)
        singers_filter.limit = req.query.limit;

    if (req.query.offset)
        singers_filter.offset = req.query.offset;

    logger.info(`Getting singers from database. UserIP: ${req.ip}`);
    const singers = await Singer.findAll(singers_filter)
    res.send(singers);
});

app.patch('/update_singer', async (req, res) => {
    logger.info(`Updating singer with id:${req.body.id}. UserIP: ${req.ip}`);
    if (find_money(req.body.name)){
        logger.warn(`You can't use this name. UserIP: ${req.ip}`);
        res.send('Певицу Монеточка никто не любит');
        return
    }
    await Singer.update({
        name: req.body.name
    },
    {
        where: {
            id: req.body.id
        }
    });
    res.send(`Обновлен певец`);
});

app.delete('/delete_singer', async (req, res) => {
    logger.info(`Deleting singer with id:${req.body.id}. UserIP: ${req.ip}`);
    await Singer.destroy({
        where: {
            id: req.body.id
        }
    });
    res.send(`Певец удален`);
});

logger.info("Starting Node.js server");
app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});