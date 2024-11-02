import express from "express";
import {
  placeBet,
  createBetResultFor30s,
  createBetResultFor1min,
  createBetResultFor3min,
  createBetResultFor5min,
} from "../controllers/bet.controller.js"; // Importing controller
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

// POST /api/bets
router.post("/place-bet", protect, placeBet); // Protecting the place bet route
router.post("/bet-result/30s", createBetResultFor30s); // No authentication needed
router.post("/bet-result/1min", createBetResultFor1min); 
router.post("/bet-result/3min", createBetResultFor3min); 
router.post("/bet-result/5min", createBetResultFor5min); 


export default router;
