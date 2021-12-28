const router = require("express").Router();
const middleware = require('../../middlewares');

// controllers
const loginController = require('../../controller/login');
const slotController = require('../../controller/slot-management');
const adController = require('../../controller/ad-management');

// login route
router.post('/login', loginController.login);

// slot management routes
router.post('/create-slot', middleware.validateToken, slotController.createSlot);
router.get('/get-slots', middleware.validateToken, slotController.getSlots);
router.post('/update-slot', middleware.validateToken, slotController.updateSlot);
router.post('/delete-slot', middleware.validateToken, slotController.deleteSlot);

// ad management routes
router.post('/create-ad', [middleware.validateToken, middleware.uploadAd], adController.createAd);
router.post('/assign-ad', middleware.validateToken, adController.assignAdToSlot);
router.post('/update-assigned-ad', middleware.validateToken, adController.updateAssignedAd);
router.post('/unassign-ad', middleware.validateToken, adController.unassignAd);

router.get('/display-ad', adController.displayAd);


module.exports = router;