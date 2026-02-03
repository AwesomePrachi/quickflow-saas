import express from 'express';
import { exportTasks } from '../controllers/reportController.js';
import { protect, authorizeCodes } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/tasks/export', protect, authorizeCodes('Admin', 'Leader'), exportTasks);

export default router;
