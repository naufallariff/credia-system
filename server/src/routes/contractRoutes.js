const express = require('express');
const router = express.Router();
const { 
    getContracts, 
    createContract, 
    getContractDetail, 
    makePayment, 
    requestChange 
} = require('../controllers/contractController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);

// Read: All roles (Scope filtered in controller)
router.get('/', getContracts);
router.get('/:id', getContractDetail);

// Write: Staff & Admin
router.post('/', authorize('STAFF', 'ADMIN'), createContract);

// Actions: Staff & Admin
router.post('/:id/pay', authorize('STAFF', 'ADMIN'), makePayment);

// Maker-Checker: Staff Requesting Changes
router.post('/:id/request-change', authorize('STAFF'), requestChange);

module.exports = router;