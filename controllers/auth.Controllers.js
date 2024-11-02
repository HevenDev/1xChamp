import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';  // Import the User model
import { generateInviteCode } from '../utils/generateInviteCode.js';


// Register Controller
export const register = async (req, res) => {
  const { name, email, password,  } = req.body;

  // Check if the user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);
  // Generate a random invite code
  const inviteCode = generateInviteCode();

  // Create a new user
  const user = new User({
    name,
    email,
    password: hashedPassword,  // Save the hashed password
    inviteCode,
  });

  // Save the user to the database
  await user.save();

  // Generate a JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  // Set the token in an HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    maxAge: 24 * 60 * 60 * 1000,  // 1 day
  });

  return res.status(201).json({ message: 'User registered successfully', user });
};

// Login Controller

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token with admin status if applicable
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin }, // Include admin status in the token
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set the token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ message: 'Logged in successfully', user: { id: user._id, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('Login error:', error); // Log the error for debugging
    return res.status(500).json({ message: 'Server error' });
  }
};


// Logout Controller
export const logout = (req, res) => {
  // Clear JWT cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Enable in production
    sameSite: 'None',
  });
  
  return res.status(200).json({ message: 'Logged out successfully' });
};

// src/controllers/userController.js

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password'); // Exclude the password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
