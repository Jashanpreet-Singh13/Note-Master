const { Schema, model } = require('mongoose');

const noteSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    pinned: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = new model('Note', noteSchema);