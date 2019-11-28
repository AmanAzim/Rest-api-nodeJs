const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed');

router.get('/posts', feedController.getPosts);

router.post('/post', feedController.postPost);

module.exports = router;