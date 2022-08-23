# Quickstart

1. Установите настройки по умолчанию для подключения к базе данных PostgreSQL на `server.js:36`:
```js
const config = new Object({
    database: "postgres",
    username: "postgres",
    password: "12345",
    host: "localhost",
    port: "5432",
    schema: "postgres"
})
```
Если они подходят, можно их не менять. Не успел доделать создание новой базы данных при запуске приложения)

2. Заходим в папку `backend/`. Прописываем следующую команду: `npm i && npm start`

3. Заходим в папку `frontend/songs_and_singer/`. Прописываем следующую команду: `npm i && npm run win:start` - для OS Windows, для OS Linux: `npm i && npm run lin:start`