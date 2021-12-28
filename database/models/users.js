const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

    firstname: {
        type: String, 
        default: ''
    },
    lastname: {
        type: String, 
        default: ''
    },
    email: {
        type: String, 
        required: true, 
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    userType: {
        type: String,
        enum: ['admin'],
        required: true
    },
    mobile: {
        type: String, 
        default: ''
    },
    profileImage: {
        type: String, 
        default: ''
    },
    address: {
        type: String, 
        default: ''
    },

}, {timestamps: true});

module.exports = mongoose.model('users', UserSchema);