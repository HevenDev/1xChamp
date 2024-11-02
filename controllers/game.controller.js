import GameTransaction from '../models/gameTransaction.model.js';
import GameHistory from '../models/gameHistory.model.js';

export const gameTransaction = async (req, res) => {
  try {
    // Ensure userId is obtained correctly from req.user (assuming req.user is set after authentication middleware)
    const userId = req.userId; // or req.user._id depending on your user model

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch transactions for the user
    const transactions = await GameTransaction.find({ userId });

    // If no transactions found, return a message
    if (!transactions.length) {
      return res.status(404).json({ message: 'No transactions found for this user' });
    }

    // Return success response with transactions
    res.status(200).json({ message: 'Game transactions fetched successfully', transactions });
  } catch (error) {
    console.error('Error fetching game transactions:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const gameHistory = async (req, res) => {
  try {
    // Ensure userId is obtained correctly from req.user (assuming req.user is set after authentication middleware)
    const userId = req.userId; // or req.user._id depending on your user model

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Fetch history for the user
    const history = await GameHistory.find({ userId }).populate('betId');

    // If no history found, return a message
    if (!history.length) {
      return res.status(404).json({ message: 'No game history found for this user' });
    }

    // Return success response with history
    res.status(200).json({ message: 'Game history fetched successfully', history });
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
