const { Sequelize, DataTypes, Op } = require('sequelize');
const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const CyrillicToTranslit = require('cyrillic-to-translit-js');
const cyrillicToTranslit = new CyrillicToTranslit();
const app = express();
let sequelize, Singer, Song;

app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    next();
});

app.use(
    express.urlencoded({
      extended: true,
    })
);
app.use(bodyParser.json());

const config = new Object({
    database: "postgres",
    username: "postgres",
    password: "12345",
    host: "localhost",
    port: "5432",
    schema: "postgres"
})

const path = './config.json';

function read_config(){
    try {
        fs.accessSync(path, fs.F_OK);
        console.log('Config exists');
    }
    catch(err){
        console.log('Config does not exist. Creating default one...');
        fs.writeFileSync('config.json', JSON.stringify(config));
        console.log('Config created successfully')
    }
    
    return fs.readFileSync(path, "utf8");
};

function conn_setup(credentials){
    sequelize = new Sequelize(credentials.database, credentials.username, credentials.password, {
        host: credentials.host,
        dialect: 'postgres'
    });
    console.log("Setup was successul");
};

async function test_conn(){
    try {
        await sequelize.authenticate();
        console.log('Соединение с БД было успешно установлено')
        return true;
    } catch (e) {
        console.log('Невозможно выполнить подключение к БД: ', e)
        return false;
    }
}

function model_init(){
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

    Song.sync({ alter: true });
    Singer.sync({ alter: true });
}

function find_money(name){
    name = name.replaceAll('0', 'o');
    name = name.replaceAll('4', 'ch');
    if (name == 'Монеточка' || cyrillicToTranslit.reverse(name) == 'Монеточка')
        return true
    return false
}

app.set("view engine", "hbs");

app.get('/', (req, res) => {
    let db_credentials = JSON.parse(read_config());
    conn_setup(db_credentials);
    if (!test_conn()){
        res.send('Неправильные данные для подключения к базе данных');
    }
    else {
        model_init();
        res.send('Инициализация базы данных успешно выполнена');
    }
});

app.post('/create_song', async (req, res) => {
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

    const songs = await Song.findAll(songs_filter);
    console.log(songs);
    res.send(songs);
});

app.patch('/update_song', async (req, res) => {
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
    await Song.destroy({
        where: {
            id: req.body.id
        }
    });
    res.send(`Песня удалена`);
});

app.post('/create_singer', async (req, res) => {
    if (find_money(req.body.name)){
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

    const singers = await Singer.findAll(singers_filter)
    res.send(singers);
});

app.patch('/update_singer', async (req, res) => {
    if (find_money(req.body.name)){
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
    await Singer.destroy({
        where: {
            id: req.body.id
        }
    });
    res.send(`Певец удален`);
});

app.listen(3000, function(){
    console.log("Сервер ожидает подключения...");
});