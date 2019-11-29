const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    creator: {
        type: Object,
        required: true
    }
}, { timestamps: true });//Mongoose will add timestamp when a new Object will be added to the database

module.exports = mongoose.model('Post', postSchema);