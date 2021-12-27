const SlotModel = require('../database/models/slots');
const moment = require('moment');

exports.createSlot = async (req, res) => {
    const { slotDate, timeStart, duration, specialSlot } = req.body;

    let data = {
        slotDate: slotDate,
        timeStart: timeStart,
        startTimestamp: moment(slotDate).valueOf(),
        endTimestamp: moment(slotDate).add(duration || 60, 'minutes').valueOf(),
        duration: parseInt(duration) || 60,
        specialSlot: specialSlot || false
    }

    const slotExists = await SlotModel.find({
        $or: [
            {
                $and: [
                    { startTimestamp: { $lte: data.startTimestamp } },
                    { endTimestamp: { $gt: data.startTimestamp } }
                ]
            },
            {
                $and: [
                    { startTimestamp: { $lt: data.endTimestamp } },
                    { endTimestamp: { $gt: data.endTimestamp } }
                ]
            },
        ]
    });

    if (slotExists.length) {
        return res.status(400).json({ success: false, message: "Slot already exists at this time" })
    }

    try {
        const insertedData = await SlotModel.create(data);
        res.json({ success: true, data: insertedData, message: "Slot created" });

    } catch (err) {
        res.status(400).json({ success: false, message: "Failed to insert data", err: err.toString() })
    }

}

exports.updateSlot = async (req, res) => {
    const { slotId, slotDate, timeStart, duration, specialSlot } = req.body;

    let data = {
        slotDate: slotDate,
        timeStart: timeStart,
        startTimestamp: moment(slotDate).valueOf(),
        endTimestamp: moment(slotDate).add(duration || 60, 'minutes').valueOf(),
        duration: parseInt(duration) || 60,
        specialSlot: specialSlot || false
    }

    const slotExists = await SlotModel.find({
        _id: { $ne: slotId },
        $or: [
            {
                $and: [
                    { startTimestamp: { $lte: data.startTimestamp } },
                    { endTimestamp: { $gt: data.startTimestamp } }
                ]
            },
            {
                $and: [
                    { startTimestamp: { $lt: data.endTimestamp } },
                    { endTimestamp: { $gt: data.endTimestamp } }
                ]
            },
        ]
    });

    if (slotExists.length) {
        return res.status(400).json({ success: false, message: "Slot already exists at this time" })
    }

    try {
        const updatedData = await SlotModel.findByIdAndUpdate(slotId, data, { new: true });
        res.json({ success: true, data: updatedData, message: "Slot updated" });

    } catch (err) {
        res.status(400).json({ success: false, message: "Failed to update data", err: err.toString() })
    }

}