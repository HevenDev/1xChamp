import Result from '../models/result.model.js';
import Bet from '../models/bet.model.js';
// Function to get the latest betting results
export const get30sResults = async (req, res) => {
  try {
    const results = await Result.find({ mode: "30s" }).sort({ createdAt: -1 }).limit(10); // Get last 10 results

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const get1minResults = async (req, res) => {
  try {
    const results = await Result.find({ mode: "1min" }).sort({ createdAt: -1 }).limit(10); 
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const get3minResults = async (req, res) => {
  try {
    const results = await Result.find({ mode: "3min" }).sort({ createdAt: -1 }).limit(10); // Get last 10 results
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const get5minResults = async (req, res) => {
  try {
    const results = await Result.find({ mode: "5min" }).sort({ createdAt: -1 }).limit(10); // Get last 10 results
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const allBets = async (req, res) => {
  try {
    const bets = await Bet.find();
    res.json(bets);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
