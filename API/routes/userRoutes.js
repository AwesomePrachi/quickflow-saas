import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, transferOwnership } from '../controllers/userController.js';
import { protect, authorizeCodes } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getUsers)
    .post(protect, authorizeCodes('Admin'), createUser);

router.route('/:id')
    .put(protect, authorizeCodes('Admin'), updateUser)
    .delete(protect, authorizeCodes('Admin'), deleteUser);

router.post('/transfer-ownership', protect, authorizeCodes('Admin'), transferOwnership);

export default router;
