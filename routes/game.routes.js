import express from 'express';
import { gameHistory, gameTransaction } from '../controllers/game.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/game-transaction', gameTransaction);
router.get('/game-history', gameHistory);

export default router;
