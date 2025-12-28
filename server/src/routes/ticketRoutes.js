const express = require('express');
const router = express.Router();
const { 
    createRequest, 
    approveRequest, 
    getTickets 
} = require('../controllers/ticketController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);

// Read Tickets (Staff sees own, Admin sees all)
router.get('/', authorize('STAFF', 'ADMIN', 'SUPERADMIN'), getTickets);

// Create Request (Staff)
router.post('/', authorize('STAFF'), createRequest);

// Process Request (Admin Only)
router.put('/:ticketId/approve', authorize('ADMIN', 'SUPERADMIN'), approveRequest);

module.exports = router;