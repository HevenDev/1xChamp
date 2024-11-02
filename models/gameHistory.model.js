import mongoose from 'mongoose';

const gameHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  betId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bet', // Reference to the Bet model
    required: true,
  },
  betType: {
    type: String,
    enum: ['color', 'number', 'big/small'], // Types of bets
    required: true,
  },
  betAmount: {
    type: Number,
    required: true,
    min: 1, // Assuming bets cannot be negative
  },
  mode: {
    type: String,
    enum: ['30s', '1min', '3min', '5min'], // Timer modes
    required: true,
  },
  result: {
    grid: {
      type: String,
      required: true,
    },
    number: {
      type: String, // The winning number
      required: true,
    },
    color: {
      type: String, // The color associated with the winning number
      enum: ['Red', 'Green', 'RedViolet', 'GreenViolet'], // Possible colors
      required: true,
    },
    size: {
      type: String,
      enum: ['Big', 'Small'], // Options for size
      required: true, // Required for each entry
    },
  },
  status: {
    type: String,
    enum: ['Win', 'Lose'], // Possible statuses of the game
    required: true,
  },
  payout: {
    type: Number,
    required: true, // Payout amount for the game entry
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set the creation date
  },
});

// Create the GameHistory model
const GameHistory = mongoose.model('GameHistory', gameHistorySchema);

export default GameHistory;
