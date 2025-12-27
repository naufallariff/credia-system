const express = require('express');
const router = express.Router();
const { createUser, getAllUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('ADMIN')); // Kunci satu file route ini HANYA untuk ADMIN

router.route('/')
    .get(getAllUsers)
    .post(createUser);

module.exports = router;