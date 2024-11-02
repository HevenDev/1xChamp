// models/Transaction.js

import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet', 
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'admin'],
    default: 'pending',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  utr: {
    type: Number, // For deposit transactions
  },
  upi: {
    type: String, // For withdrawal transactions
  },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
