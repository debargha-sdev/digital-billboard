const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SlotsSchema = new Schema({

    slotStart: {
        type: Date,
        required: true
    },
    slotEnd: {
        type: Date,
        required: true
    },
    adId: {
        type: Schema.Types.ObjectId
    },
    duration: {
        type: Number, // in minute
        default: 60
    },
    specialSlot: {
        type: Boolean,
        default: false
    },
    displayed: {
        type: Boolean,
        default: false
    }

}, {timestamps: true});

module.exports = mongoose.model('slots', SlotsSchema);