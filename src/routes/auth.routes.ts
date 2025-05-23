// Create this file: src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller'; // Import login

const router = Router();

router.post('/register', register);
router.post('/login', login); // Login will be added in a subsequent step

export default router;
