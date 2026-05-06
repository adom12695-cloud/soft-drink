const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/userController');
const { protect, verifyRole } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', verifyRole('distributor'), getAllUsers);
router.get('/:id', verifyRole('distributor'), getUserById);
router.put('/:id', verifyRole('distributor'), updateUser);
router.patch('/:id/toggle-status', verifyRole('distributor'), toggleUserStatus);
router.delete('/:id', verifyRole('distributor'), deleteUser);

module.exports = router;
