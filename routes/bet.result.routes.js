import express from 'express';
import { get30sResults, get1minResults, get3minResults, get5minResults, allBets } from '../controllers/betResult.controller.js'; // Importing controller
  
const router = express.Router();

// GET /api/betresult
router.get('/result/30s', get30sResults); // Using the controller function
router.get('/result/1min', get1minResults); // Using the controller function
router.get('/result/3min', get3minResults); // Using the controller function
router.get('/result/5min', get5minResults); // Using the controller function

router.get('/', allBets);

export default router;
