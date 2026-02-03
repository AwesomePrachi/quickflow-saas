import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { protect, authorizeCodes } from '../middleware/authMiddleware.js';

const router = express.Router();

// All users can GET tasks (filtered by role in controller)
// Only Admin and Leader can CREATE tasks
router.route('/')
    .get(protect, getTasks)
    .post(protect, authorizeCodes('Admin', 'Leader'), createTask);

// All users can UPDATE (role-specific permissions enforced in controller)
// Only Admin and Leader can DELETE tasks
router.route('/:id')
    .put(protect, updateTask) // No role restriction - controller handles it
    .delete(protect, authorizeCodes('Admin', 'Leader'), deleteTask);

export default router;
