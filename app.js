const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const feedRoute = require('./routes/feed');

//Used for REST api to parse json data
app.use(bodyParser.json());

//To prevent CORS error//to allow any server to stablish communication with it
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Header', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoute);

app.listen(8080);