const express = require('express');
const router = express.Router();
const {
    createRequest,
    approveRequest,
    getTickets
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// View Tickets: Transparansi untuk semua internal tim
router.get('/', authorize('STAFF', 'ADMIN', 'SUPERADMIN'), getTickets);

// Create Request: Staff yang menemukan kesalahan/perlu void
router.post('/', authorize('STAFF'), createRequest);

// Resolution: Admin yang memutuskan apakah request valid
router.patch('/:ticketId/resolution', authorize('ADMIN', 'SUPERADMIN'), approveRequest);

module.exports = router;