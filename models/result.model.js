import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    grid: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      enum: ['Red', 'Green', 'RedViolet', 'GreenViolet'], // Possible colors
    },
    smallOrBig: {
      type: String,
      required: true,
      enum: ['Small', 'Big'], // Types for small/big
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

const Result = mongoose.model('Result', resultSchema);
export default Result;
