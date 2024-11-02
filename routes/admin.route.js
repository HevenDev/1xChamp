import express from 'express';
import { getTransactionSummary, approveTransaction, declineTransaction, getTransactions, getUserDetailsAndWallet, updateWalletMoney } from '../controllers/admin.controllers.js';

const router = express.Router();

// Example admin-only route
router.get('/transactions/summary', getTransactionSummary);
router.get('/transactions', getTransactions);
// Approve a transaction
router.post('/approve', approveTransaction);

// Decline a transaction
router.post('/decline', declineTransaction);

router.get('/user/:inviteCode', getUserDetailsAndWallet);
router.post('/user/:walletId', updateWalletMoney);

// Add other admin routes as needed

export default router;
