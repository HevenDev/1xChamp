import express from 'express';
import { createCode, useCode, getAllCodes, deleteCode } from '../controllers/code.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Route to create a new code (admin only)
router.post('/create', createCode);

// Route to use a code to increase wallet balance
router.post('/use', useCode);

// Route to get all codes (admin only)
router.get('/all', getAllCodes);
router.delete('/:id', deleteCode); // New endpoint for deleting a code

export default router;
