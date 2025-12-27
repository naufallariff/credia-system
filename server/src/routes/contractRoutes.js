const express = require('express');
const router = express.Router();
const {
    createNewContract,
    getContractDashboard,
    getAllContracts,
    updateContract,
    deleteContract,
    processPayment // Pastikan ini di-export dari contractController.js
} = require('../controllers/contractController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect); // Global Guard

// 1. General Routes
router.route('/')
    .post(authorize('ADMIN', 'STAFF'), createNewContract)
    .get(getAllContracts);

// 2. Specific Action Routes (Harus ditaruh sebelum route ID generic jika conflict, tapi disini aman)
// Route Pembayaran
router.post(
    '/:contractNo/installments/:month/pay', 
    authorize('ADMIN', 'STAFF'), // Client TIDAK BOLEH akses ini
    processPayment
);

// 3. Specific ID Routes
router.route('/:contractNo')
    .get(getContractDashboard)
    .patch(authorize('ADMIN'), updateContract)
    .delete(authorize('ADMIN'), deleteContract);

module.exports = router;