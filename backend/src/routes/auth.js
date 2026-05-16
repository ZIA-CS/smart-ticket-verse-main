import express from 'express';
import { register, login, logout, me } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Logout route
router.post('/logout', logout);

// Current user route
router.get('/me', authenticateToken, me);

export default router;
