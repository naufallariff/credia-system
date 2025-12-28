const express = require('express');
const router = express.Router();
const { getUsers, createUser, approveUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);

// Read: Admin, Staff, Client (Self)
router.get('/', authorize('SUPERADMIN', 'ADMIN', 'STAFF', 'CLIENT'), getUsers);

// Write: Admin Only (Manual Creation)
router.post('/create', authorize('SUPERADMIN', 'ADMIN'), createUser);

// Approval: Admin Only (Lead -> Client)
router.put('/approve/:id', authorize('SUPERADMIN', 'ADMIN'), approveUser);

module.exports = router;