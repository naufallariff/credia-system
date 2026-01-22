const express = require('express');
const router = express.Router();
const { getUsers, createUser, approveUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// GET /api/users
// Admin/Superadmin: Audit users. Staff: View Clients. Client: View Self.
router.get('/', authorize('SUPERADMIN', 'ADMIN', 'STAFF', 'CLIENT'), getUsers);

// POST /api/users
// Strict: Hanya Superadmin/Admin yang boleh membuat user staff manual
router.post('/', authorize('SUPERADMIN', 'ADMIN'), createUser);

// PATCH /api/users/:id/approval
// Proses memverifikasi Client yang daftar sendiri (Lead -> Client)
router.patch('/:id/approval', authorize('ADMIN', 'SUPERADMIN'), approveUser);

module.exports = router;