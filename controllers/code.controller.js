import Code from '../models/code.model.js';
import Wallet from '../models/wallet.model.js';

// Create a new code
export const createCode = async (req, res) => {
  const { code, amount } = req.body;

  try {
    const existingCode = await Code.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ message: 'Code already exists' });
    }

    const newCode = new Code({ code, amount });
    await newCode.save();

    res.status(201).json({ message: 'Code created successfully', code: newCode });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const useCode = async (req, res) => {
  const { code } = req.body;
  const userId = req.userId; // Assuming you're storing userId in req.userId

  try {
    const existingCode = await Code.findOne({ code });
    if (!existingCode) {
      return res.status(404).json({ message: 'Invalid code' });
    }

    // Ensure redeemedBy is initialized
    if (!Array.isArray(existingCode.redeemedBy)) {
      existingCode.redeemedBy = []; // Initialize it as an empty array if it's undefined
    }

    // Check if the user has already redeemed this code
    if (existingCode.redeemedBy.includes(userId)) {
      return res.status(400).json({ message: 'You have already redeemed this code' });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Increase wallet balance
    wallet.balance += existingCode.amount;
    await wallet.save();

    // Mark the code as redeemed by this user
    existingCode.redeemedBy.push(userId);
    await existingCode.save();

    res.status(200).json({ message: 'Code applied successfully', newBalance: wallet.balance });
  } catch (error) {
    console.error(error); // Log the error to the console
    res.status(500).json({ message: 'Server error', error: error.message }); // Return the error message
  }
};


// Delete a code
export const deleteCode = async (req, res) => {
  const { id } = req.params;

  try {
    const code = await Code.findByIdAndDelete(id);
    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    res.status(200).json({ message: 'Code deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all codes (for admin)
export const getAllCodes = async (req, res) => {
  try {
    const codes = await Code.find();
    res.status(200).json(codes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
