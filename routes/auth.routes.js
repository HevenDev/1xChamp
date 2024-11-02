import express from 'express';
import { login, logout, register, getUser } from '../controllers/auth.Controllers.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public login route
router.post('/login', login);
router.post('/signup', register);  // User registration route

// Protected route example
router.get('/protected', protect, (req, res) => {
  res.json({ message: 'Access to protected route!', userId: req.userId });
});

router.get('/user', protect, getUser);

// Logout route
router.post('/logout', logout);

export default router;
