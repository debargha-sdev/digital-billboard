const AdsModel = require('../database/models/ads');
const SlotModel = require('../database/models/slots');

const env = require('../env');
const config = global.config = require('../config')[env.mode || 'development'];

const fs = require('fs');

/**
 * Create ad function is used to create new add, upload the ad file into the server
 * @param adName Name of the add
 * @param file File contails the ad file (image/video)
 */
exports.createAd = async (req, res) => {
    const { adName } = req.body;

    console.log('========',req.file.filename)
    if (!req.file.filename) {
        return res.status(400).json({ success: false, message: 'Invalid file' });
    }

    try {
        const insertedData = await AdsModel.create({
            adName: adName,
            url: config.url + '/public/' + req.file.filename
        });

        res.json({ success: true, data: insertedData, message: 'ad uploaded' });

    } catch (err) {
        res.status(400).json({ success: false, err: err.toString(), message: 'failed to upload ad' });
    }
}

/**
 * Assign to slot function is used to assign a add to a specific time slot if the slot is free
 * @param slotId _id' of the slot
 * @param adId _id' of the ad
 */
exports.assignAdToSlot = async (req, res) => {
    const { slotId, adId } = req.body;

    try {
        const slotDetails = await SlotModel.findById(slotId);

        if (!slotDetails) {
            return res.status(400).json({ success: false, message: "Invalid slot id" });

        } else if (slotDetails.adId) {
            return res.status(400).json({ success: false, message: "Slot is not empty. Try another one." });

        }

        const now = new Date().getTime();
        const slotStartTime = slotDetails.startTimestamp;

        // cannot assign add to old timeslot
        if (slotDetails.endTimestamp < now) {
            return res.status(400).json({ success: false, message: "Slot exipred. Cannot assign add to old timeslot" });

        }
        // Ad can only be added on system one day prior to the day when it needs to be shown on Screens.
        else if (slotStartTime > (now + 24 * 60 * 60 * 1000)) {
            return res.status(400).json({ success: false, message: "Ad can only be added on system one day prior to the day when it needs to be shown on Screens." });

        }

        const assignedData = await SlotModel.findByIdAndUpdate(slotId, { $set: { adId } }, { new: true });
        res.json({ success: true, data: assignedData, message: 'Ad assigned to slot' });

    } catch (err) {
        res.status(400).json({ success: false, err: err.toString(), message: 'Failed to assign ad' });
    }
}

/**
 * Unassign slot function is used to unassign a slot
 * @param slotId '_id' of the slot
 */
exports.unassignAd = async (req, res) => {
    const { slotId } = req.body;

    try {
        const slotDetails = await SlotModel.findById(slotId);

        if (!slotDetails) {
            return res.status(400).json({ success: false, message: "Invalid slot id" });

        } else if (!slotDetails.adId) {
            return res.status(400).json({ success: false, message: "Slot is already empty" });

        }

        const unassignedData = await SlotModel.findByIdAndUpdate(slotId, { $set: { adId: null } }, { new: true });
        res.json({ success: true, data: unassignedData, message: 'Ad unassigned' });

    } catch (err) {
        res.status(400).json({ success: false, err: err.toString(), message: 'Failed to unassign ad' });
    }
}

/**
 * Update Assign to slot function is used to assign a add to a specific time 
 * slot if the slot is previously assigned
 * @param slotId _id' of the slot
 * @param adId _id' of the ad
 */
exports.updateAssignedAd = async (req, res) => {
    const { slotId, adId } = req.body;

    try {
        const slotDetails = await SlotModel.findById(slotId);

        if (!slotDetails) {
            return res.status(400).json({ success: false, message: "Invalid slot id" });

        } else if (!slotDetails.adId) {
            return res.status(400).json({ success: false, message: "No ad assigned on this slot" });

        }

        const updatedData = await SlotModel.findByIdAndUpdate(slotId, { $set: { adId } }, { new: true });
        res.json({ success: true, data: updatedData, message: 'Ad updated' });

    } catch (err) {
        res.status(400).json({ success: false, err: err.toString(), message: 'Failed to update ad' });
    }
}

/**
 * Display ad function returns the available ad in the current time
 */
exports.displayAd = async (req, res) => {
    const now = new Date().getTime();

    // fecth data for current time
    let slotDetails = await SlotModel.aggregate([
        {
            '$match': {
                'startTimestamp': {
                    '$lte': now
                },
                'endTimestamp': {
                    '$gt': now
                }
            }
        }, {
            '$lookup': {
                'from': 'ads',
                'let': {
                    'id': '$adId'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$and': [
                                    { '$eq': ['$_id', '$$id'] },
                                    { '$eq': ['$deleted', false] }
                                ]
                            }
                        }
                    }
                ],
                'as': 'adDetails'
            }
        }, {
            '$unwind': {
                'path': '$adDetails',
                'preserveNullAndEmptyArrays': true
            }
        }
    ]);

    slotDetails = slotDetails[0];

    // if there is no slot then add a dummy slot data with no-add image
    if (!slotDetails) {
        slotDetails = {},
            slotDetails.slotDate = new Date().toISOString;
        slotDetails['adDetails'] = {
            adName: "No ad",
            url: config.url + '/assets/no-ad.jpg'
        }
    }
    // if the slot is not assigned then add dummy adDetails with no-ad image
    else if (!slotDetails.adDetails) {
        slotDetails['adDetails'] = {
            adName: "No ad",
            url: config.url + '/assets/no-ad.jpg'
        }
    }

    // mark the slot details as displayed
    if (!slotDetails.displayed) {
        await SlotModel.findByIdAndUpdate(slotDetails._id, { $set: { displayed: true } });
    }

    res.json({ success: true, data: slotDetails, message: "Data fetched" });
}