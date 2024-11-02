import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';

// Create or get the user's wallet
export const getWallet = async (req, res) => {
  const userId = req.userId; // Assuming userId is stored in req.userId

  try {
    let wallet = await Wallet.findOne({ user: userId });

    // If no wallet found, create a new one for the user
    if (!wallet) {
      wallet = new Wallet({
        user: userId,
        balance: 0,
        transactions: [],
      });
      await wallet.save();
    }
    const formattedBalance = parseFloat(wallet.balance.toFixed(2));
    res.status(200).json({
      balance: formattedBalance,
      transactions: wallet.transactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting wallet data' });
  }
};

export const deposit = async (req, res) => {
  const userId = req.userId; // Assuming you're storing userId in req.userId
  const { amount, utr } = req.body;

  // Minimum deposit amount
  const MIN_DEPOSIT_AMOUNT = 200;

  const utrString = utr.toString();
  if (utrString.length !== 12) {
    return res.status(400).json({ message: 'Invalid UTR, Enter 12 digit UTR' });
  }

  if (amount < MIN_DEPOSIT_AMOUNT) {
    return res.status(400).json({ message: `Minimum deposit amount is ${MIN_DEPOSIT_AMOUNT} rupees` });
  }

  try {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Create a pending transaction
    const transaction = new Transaction({
      amount,
      utr,
      type: 'deposit',
      status: 'pending', // New field for transaction status
      user: userId,
      wallet: wallet._id,
    });

    await transaction.save();
    wallet.transactionHistory.push(transaction._id);
    await wallet.save();

    res.status(200).json({ message: 'Deposit request submitted successfully', transaction });
  } catch (error) {
    console.error('Error during deposit:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error in deposit' });
  }
};

// Withdraw money from wallet

export const withdraw = async (req, res) => {
  const userId = req.userId; // Assuming you're storing userId in req.userId
  const { amount, upi } = req.body;

  // Minimum withdrawal amount
  const MIN_WITHDRAW_AMOUNT = 210;

  if (amount < MIN_WITHDRAW_AMOUNT) {
    return res.status(400).json({ message: `Minimum withdrawal amount is ${MIN_WITHDRAW_AMOUNT} rupees` });
  }

  try {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create a pending transaction
    const transaction = new Transaction({
      amount,
      upi,
      type: 'withdrawal',
      status: 'pending', // New field for transaction status
      user: userId,
      wallet: wallet._id,
    });

    await transaction.save();
    wallet.transactionHistory.push(transaction._id);
    await wallet.save();

    res.status(200).json({ message: 'Withdrawal request submitted successfully', transaction });
  } catch (error) {
    console.error('Error during deposit:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error in withdrawal' });
  }
};

/*
export const withdraw = async (req, res) => {
  const userId = req.userId; // Assuming you're storing userId in req.userId
  const { amount, description } = req.body;

  try {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update balance and create transaction
    wallet.balance -= amount;
    await wallet.save();

    const transaction = new Transaction({
      wallet: wallet._id,
      amount,
      type: 'withdraw',
      description,
    });

    await transaction.save();
    wallet.transactionHistory.push(transaction._id);
    await wallet.save();

    res.status(200).json({ message: 'Withdrawal successful', wallet });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
*/
// Get transaction history
export const getTransactionHistory = async (req, res) => {
  const userId = req.userId; // Assuming you're storing userId in req.userId

  try {
    const wallet = await Wallet.findOne({ user: userId }).populate('transactionHistory');

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    res.status(200).json(wallet.transactionHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
