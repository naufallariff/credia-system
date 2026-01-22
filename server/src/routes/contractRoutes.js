const express = require('express');
const router = express.Router();
const {
    getContracts,
    createContract,
    getContractDetail,
    updateContractStatus,
    makePayment,
    requestChange
} = require('../controllers/contractController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// --- 1. VIEW ACCESS ---
// Admin/Staff: Liat semua (Monitoring). Client: Liat punya sendiri.
router.get('/', getContracts);
router.get('/:id', getContractDetail);

// --- 2. SUBMISSION (THE MAKER) ---
// Hanya STAFF yang boleh membuat pengajuan kontrak resmi setelah KYC.
// Admin dilarang create agar tidak ada abuse of power (buat sendiri, approve sendiri).
router.post('/', authorize('STAFF'), createContract);

// --- 3. APPROVAL (THE CHECKER) ---
// Hanya ADMIN/SUPERADMIN yang boleh ketok palu (Approve/Reject).
router.patch('/:id/status', authorize('ADMIN', 'SUPERADMIN'), updateContractStatus);

// --- 4. OPERATIONAL (CASHIER) ---
// Staff menerima uang dan input ke sistem.
router.post('/:id/payments', authorize('STAFF'), makePayment);

// --- 5. EXCEPTION HANDLING ---
// Jika data kontrak salah input, Staff request perubahan via tiket.
router.post('/:id/change-requests', authorize('STAFF'), requestChange);

module.exports = router;