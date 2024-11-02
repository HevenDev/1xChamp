import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  redeemedBy: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('Code', codeSchema);
