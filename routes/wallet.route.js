import express from 'express';
import { getWallet, deposit, withdraw, getTransactionHistory } from '../controllers/wallet.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Route to get the user's wallet
router.get('/', getWallet);

// Route to deposit money
router.post('/deposit', deposit);

// Route to withdraw money
router.post('/withdraw', withdraw);

// Route to get transaction history
router.get('/transactions', getTransactionHistory);

export default router;
