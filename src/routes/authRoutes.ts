import express from 'express';
import { loginHandler, registerHandler } from '../controllers/authController';

const router = express.Router();

// POST /auth/login
router.post('/login', loginHandler);

// POST /auth/register
router.post('/register', registerHandler);

export default router;
