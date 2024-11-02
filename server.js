import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import walletRoutes from './routes/wallet.route.js';
import codeRoutes from './routes/code.route.js';
import adminRoutes from './routes/admin.route.js'; 
import betRoutes from './routes/bet.routes.js';
import betResultRoutes from './routes/bet.result.routes.js';
import gameRoutes from './routes/game.routes.js';
dotenv.config();  // Load environment variables

// Initialize Express app
const app = express();



// After initializing your Express app
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}));


// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Wallet routes
app.use('/api/wallet', walletRoutes);  // Use wallet routes
// Code routes
app.use('/api/code', codeRoutes); // Use code routes

// Use admin routes
app.use('/api/admin', adminRoutes);

app.use('/api/bets', betRoutes);

app.use('/api/bets', betResultRoutes);

app.use('/api/game', gameRoutes);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
