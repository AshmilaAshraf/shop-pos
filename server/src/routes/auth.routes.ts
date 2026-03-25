import { Router } from 'express';
import { login, register, getRSAPublicKey, logout, me } from '../controllers/auth.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/public-key', getRSAPublicKey);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);

// Protected Admin Route to create new users
router.post('/register', authenticateToken, isAdmin, register);

export default router;
