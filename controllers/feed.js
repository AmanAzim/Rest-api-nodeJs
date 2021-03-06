const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find().countDocuments()
        .then( count => {
            totalItems = count;

            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then( post => {
            if (!post) {
                const error = new Error('No Post found');
                error.statusCode = 422;
                throw error;
            }
            res.status(200).json({
                message: 'Post created successfully',
                posts: post,
                totalItems: totalItems
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                   err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    console.log('in create post')
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const image = req.file.path.replace("\\" ,"/");//path generated by multer
    let creator;

    const post = new Post({
        title: title,
        content: content,
        image: image,//'images/aman.jpg',
        creator: req.userId
    });
    post.save()
        .then( result => {
            return User.findById(req.userId);
        })
        .then( user => {
            creator = user;
            user.posts.push(post);//Pushing a full mongoose object
            return user.save();
        })
        .then( result => {
            res.status(201).json({
                message: 'Post created successfully',
                post: post,
                creator: {
                    _id: creator._id,
                    name: creator.name
                }
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                   err.statusCode = 500;
            }
            next(err);
        });
};

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then( post => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Post fetched', post: post });
        })
        .catch( err => {
            if (!err.statusCode) {
                   err.statusCode = 500;
            }
            next(err);
        });
};

exports.updatePost = (req ,res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let image = req.body.image;
    if (req.file) {
        image = req.file.path.replace("\\","/");
    }
    if (!image) {
        const error = new Error('No image file picked');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then( post => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId) {
                const error = new Error('Could not find post');
                error.statusCode = 403;
                throw error;
            }

            if (image !== post.image) {
                clearImage(post.image);
            }

            post.title = title;
            post.content = content;
            post.image = image;
            return post.save();
        })
        .then( response => {
            res.status(200).json({ message: 'Post fetched', post: response });
        })
        .catch( err => {
            if (!err.statusCode) {
                   err.statusCode = 500;
            }
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then( post => {
            if (!post) {
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId) {
                const error = new Error('Could not find post');
                error.statusCode = 403;
                throw error;
            }

            clearImage(post.image);
            return Post.findByIdAndRemove(postId);
        })
        .then( result => {
            return User.findById(req.userId);
        })
        .then( user => {
            user.posts.pull(postId);//To clear a object from post array of user object
            return user.save();
        })
        .then( result => {
            res.status(200).json({ message: 'Post deleted' });
        })
        .catch( err => {
            if (!err.statusCode) {
                   err.statusCode = 500;
            }
            next(err);
        })
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, (err) => console.log(err));
};
