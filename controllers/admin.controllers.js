// controllers/adminController.js

import Transaction from '../models/transaction.model.js'; // Adjust the path as necessary
import mongoose from 'mongoose';
import Wallet from '../models/wallet.model.js';
import User from '../models/user.model.js';
// Get all pending transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('wallet user');
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error during getTransactions:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error in getTransactions' });
  }
};

// Approve a transaction

export const approveTransaction = async (req, res) => {
  const { transactionId } = req.body;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return res.status(400).json({ message: 'Invalid transaction ID format' });
  }

  try {
    // Fetch the transaction and populate the wallet and user fields
    const transaction = await Transaction.findById(transactionId).populate('wallet user');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }

    // Update the transaction status to approved
    transaction.status = 'approved';
    await transaction.save();

    // Fetch the wallet from the populated transaction
    const wallet = transaction.wallet; // This is now populated

    // Check transaction type and update wallet balance
    if (transaction.type === 'deposit') {
      // If it's a deposit, add money to the wallet
      wallet.balance += transaction.amount; // Assuming transaction has an amount field
    } else if (transaction.type === 'withdrawal') { // Corrected to 'withdrawal'
      // If it's a withdrawal, debit money from the wallet
      if (wallet.balance < transaction.amount) {
        return res.status(400).json({ message: 'Insufficient funds for withdrawal' });
      }
      wallet.balance -= transaction.amount;
    } else {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Save the updated wallet balance
    await wallet.save();

    res.status(200).json({
      message: 'Transaction approved successfully',
      transaction,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Error in approveTransaction:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Decline a transaction
export const declineTransaction = async (req, res) => {
  const { transactionId } = req.body;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    return res.status(400).json({ message: 'Invalid transaction ID format' });
  }

  try {
    const transaction = await Transaction.findById(transactionId).populate('wallet user');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction is not pending' });
    }

    // Update the transaction status to declined
    transaction.status = 'declined';
    await transaction.save();

    res.status(200).json({ message: 'Transaction declined successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTransactionSummary = async (req, res) => {
  try {
    const now = new Date();

    // Calculate totals for the last 24 hours
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const depositTotal24 = await Transaction.aggregate([
      { $match: { type: 'deposit', createdAt: { $gte: last24Hours } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const withdrawTotal24 = await Transaction.aggregate([
      { $match: { type: 'withdrawal', createdAt: { $gte: last24Hours } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Calculate totals for the last 7 days
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const depositTotal7 = await Transaction.aggregate([
      { $match: { type: 'deposit', createdAt: { $gte: last7Days } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const withdrawTotal7 = await Transaction.aggregate([
      { $match: { type: 'withdrawal', createdAt: { $gte: last7Days } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Calculate totals for the last 28 days
    const last28Days = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const depositTotal28 = await Transaction.aggregate([
      { $match: { type: 'deposit', createdAt: { $gte: last28Days } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const withdrawTotal28 = await Transaction.aggregate([
      { $match: { type: 'withdrawal', createdAt: { $gte: last28Days } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Calculate all-time totals
    const allTimeDepositTotal = await Transaction.aggregate([
      { $match: { type: 'deposit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const allTimeWithdrawTotal = await Transaction.aggregate([
      { $match: { type: 'withdrawal' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Prepare response data
    res.status(200).json({
      deposit: {
        total24: depositTotal24[0]?.total || 0,
        total7: depositTotal7[0]?.total || 0,
        total28: depositTotal28[0]?.total || 0, // Include 28 days total
        allTime: allTimeDepositTotal[0]?.total || 0,
      },
      withdrawal: {
        total24: withdrawTotal24[0]?.total || 0,
        total7: withdrawTotal7[0]?.total || 0,
        total28: withdrawTotal28[0]?.total || 0, // Include 28 days total
        allTime: allTimeWithdrawTotal[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Error in getTransactionSummary:', error);
    res.status(500).json({ message: 'Server error in getTransactionSummary' });
  }
};

export const getUserDetailsAndWallet = async (req, res) => {
  try {
    // Find the user by invite code
    const user = await User.findOne({ inviteCode: req.params.inviteCode });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the wallet associated with the user
    const wallet = await Wallet.findOne({ user: user._id })
      .populate({
        path: 'transactionHistory',
        populate: {
          path: 'user', // Populate user info for each transaction, if needed
          select: 'name email', // Adjust according to what fields you want to retrieve
        }
      });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Return the user and wallet details
    res.json({
      user: {
        id: user._id,
        name: user.name, // Adjust according to the fields you want to return
        email: user.email,
        inviteCode: user.inviteCode,
      },
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        transactions: wallet.transactionHistory, // This will contain populated transaction details
      }
    });
  } catch (error) {
    console.error('Error retrieving user and wallet details:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};


// Add or withdraw money
// Import the Transaction model

export const updateWalletMoney = async (req, res) => {
  const { action, amount } = req.body; // Ensure walletId is included

  const walletId = req.params.walletId;

  try {
    const wallet = await Wallet.findById(walletId).populate('user'); // Use walletId from request body
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const userId = wallet.user._id;
    let transaction; // Declare a variable to hold the transaction

    if (action === 'add') {
      wallet.balance += amount;
      transaction = await Transaction.create({
        wallet: wallet._id,
        amount,
        type: 'deposit',
        user: userId,
        status: 'admin',
      });
      wallet.transactionHistory.push(transaction._id);
    } else if (action === 'withdraw') {
      if (wallet.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
      wallet.balance -= amount;
      transaction = await Transaction.create({
        wallet: wallet._id,
        amount,
        type: 'withdrawal',
        user: userId,
        status: 'admin',
      });
      wallet.transactionHistory.push(transaction._id);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await wallet.save(); // Save the updated wallet
    res.json({ message: 'Transaction successful', wallet });
  } catch (error) {
    console.error('Error occurred during transaction:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};




