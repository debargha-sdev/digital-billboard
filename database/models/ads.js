const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdSchema = new Schema({

    adName: {
        type: String
    },
    url: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

module.exports = mongoose.model('ads', AdSchema);