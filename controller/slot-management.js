const SlotModel = require('../database/models/slots');
const moment = require('moment');

/**
 * Get slots function is used to fetch all undeleted slots
 */
exports.getSlots = async (req, res) => {
    const slots = await SlotModel.find({ deleted: false }).sort({startTimestamp: -1}).populate('adId');
    res.json({ success: true, data: slots, message: "Data fetched successfully" });
}

/**
 * Create slot function is used to create a new slot on a specific 
 * date and time if there is no slot exists already
 * @param slotDate Slot date with start time in ISO format
 * @param timeStart string contains the start time of the slot
 * @param duration Duration of the slot (*optional)
 * @param specialSlot Special slot flag (*optional)
 * @returns res - { success<Boolean>, message<String>, data<Object>, err<String> }
 */
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
        ],
        deleted: false
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

/**
 * Create slot function is used to create a new slot on a specific 
 * date and time if there is no slot exists already
 * @param slotId '_id' of the slot
 * @param slotDate Slot date with start time in ISO format
 * @param timeStart string contains the start time of the slot
 * @param duration Duration of the slot (*optional)
 * @param specialSlot Special slot flag (*optional)
 * @returns res - { success<Boolean>, message<String>, data<Object>, err<String> }
 */
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
        ],
        deleted: false
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

/**
 * Delete slot function change the slot deleted value to true
 * @param slotId '_id' of the slot
 * @returns res - { success<Boolean>, message<String>, data<Object>, err<String> }
 */
exports.deleteSlot = async (req, res) => {
    const { slotId } = req.body;
    const slotData = await SlotModel.findById(slotId);

    // check slot data exists or not
    if (!slotData) {
        return res.status(400).json({ success: false, message: "Invalid slot id" });

    } // if data already deleted (deleted == true) then return error
    else if (slotData.deleted) {
        return res.status(400).json({ success: false, message: "Slot is already deleted" });
    }

    const deleted = await SlotModel.findByIdAndUpdate(slotId, { deleted: true });
    res.json({ success: true, message: "Slot deleted" });
}