const express = require('express');
const router = express.Router();
const {
    getContracts,
    createContract,
    getContractDetail,
    updateContractStatus, // <-- 1. WAJIB IMPORT INI (Fungsi baru)
    makePayment,
    requestChange
} = require('../controllers/contractController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.use(protect);

// Read: All roles (Scope filtered in controller)
router.get('/', getContracts);
router.get('/:id', getContractDetail);

// Write: Staff & Admin (Create Application)
router.post('/', authorize('STAFF', 'ADMIN'), createContract);

// --- UPDATE PENTING DI SINI ---
// Approval Workflow: Admin & Superadmin Only
// Ini menangani tombol "Approve" atau "Reject" dari Admin Action Bar di Frontend
router.patch('/:id', authorize('ADMIN', 'SUPERADMIN'), updateContractStatus);

// Actions: Staff & Admin (Installment Payment)
router.post('/:id/pay', authorize('STAFF', 'ADMIN'), makePayment);

// Maker-Checker: Staff Requesting Changes (Ticket System)
router.post('/:id/request-change', authorize('STAFF'), requestChange);

module.exports = router;