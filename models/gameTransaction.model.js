import mongoose from "mongoose";

const gameTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["debit", "credit"], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  mode: { type: String, enum: ["30s", "1min", "3min", "5min"], required: true },
});

const GameTransaction = mongoose.model(
  "GameTransaction",
  gameTransactionSchema
);

export default GameTransaction;
