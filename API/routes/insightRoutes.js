import express from 'express';
import { getProductivity, getRisks, getTrend } from '../controllers/insightController.js';
import { protect, authorizeCodes } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/productivity', protect, authorizeCodes('Admin', 'Leader'), getProductivity);
router.get('/risks', protect, authorizeCodes('Admin', 'Leader'), getRisks);
router.get('/trend', protect, authorizeCodes('Admin', 'Leader'), getTrend);

export default router;
