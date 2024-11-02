import mongoose from 'mongoose';

const betSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.98, // Assuming bets cannot be negative
    },
    betType: {
      type: String,
      enum: ['color', 'number', 'big/small'], // Types of bets
      required: true,
    },
    color: {
      type: String,
      enum: ['Red', 'Green', 'Voilet'], // Specify colors for 'color' betType
      required: function() { return this.betType === 'color'; }, // Only required if betType is 'color'
    },
    number: {
      type: String,
      min: 0,
      max: 9,
      required: function() { return this.betType === 'number'; }, // Only required if betType is 'number'
    },
    size: {
      type: String,
      enum: ['Big', 'Small'], // Options for 'big/small' betType
      required: function() { return this.betType === 'big/small'; }, // Only required if betType is 'big/small'
    },
    mode: {
      type: String,
      enum: ['30s', '1min', '3min', '5min'], // Timer modes
      required: true,
    },
  },
  {
    timestamps: true, // Automatically create createdAt and updatedAt fields
  }
);

const Bet = mongoose.model('Bet', betSchema);
export default Bet;
