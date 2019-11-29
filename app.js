const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const uuidv4 = require('uuid/v4');//for multer

const feedRoute = require('./routes/feed');
const authRoute = require('./routes/auth');

const MONGODB_URI = 'mongodb+srv://aman_azim:aman@cluster0-hq0lj.mongodb.net/blog';

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4());
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

//Used for REST api to parse json data
app.use(bodyParser.json());

//For parsing image from incoming request
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

//To static serve images folder
app.use('/images', express.static(path.join(__dirname, 'images')));

//To prevent CORS error//to allow any server to stablish communication with it
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Header', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoute);
app.use('/auth', authRoute);

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(statusCode).json({ message, data });
});

mongoose.connect(MONGODB_URI)
    .then( result => {
        app.listen(8080);
    }).catch(err => console.log(err));