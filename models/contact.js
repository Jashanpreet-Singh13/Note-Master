const { Schema, model } = require('mongoose');

const contactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    msg: {
        type: String,
        required: true
    }
}, {timestamps : true} );

module.exports = new model('Contact', contactSchema);