const router = require("express").Router();
const loginController = require('../../controller/login');
const slotController = require('../../controller/slot-management');

router.post('/login', loginController.login);
router.post('/create-slot', slotController.createSlot);
router.post('/update-slot', slotController.updateSlot);


module.exports = router;