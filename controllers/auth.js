const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');//For creating json web token for rest api

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = error.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password, 12)
        .then( hashedPassword => {
            const user = new User({
                email,
                name,
                password: hashedPassword
            });
            return user.save();
        })
        .then( result => {
            res.status(201).json({ message: 'User created', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
               err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    User.findOne({ email: email })
        .then( user => {
            if (!user) {
                const error = new Error('A user with this email is not found');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);// matching encrypted password
        })
        .then( isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password');
                error.statusCode = 401;
                throw error;
            }
            //Creating web token
            const token = jwt.sign({
                email: loadedUser.email,//Just adding some combination for more excription
                userId: loadedUser._id.toString()
            }, 'mysupersecret', { expiresIn: '1h' });//a signing key from server

            res.status(200).json({ token, userId: loadedUser._id.toString() });
        })
        .catch( err => {
            if (!err.statusCode) {
               err.statusCode = 500;
            }
            next(err);
        });
};