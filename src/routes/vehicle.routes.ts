// Create src/routes/vehicle.routes.ts
import { Router } from 'express';
import { addVehicle, getMyVehicles } from '../controllers/vehicle.controller';
import { authenticateToken } from '../middleware/auth.middleware'; // Use your actual path

const router = Router();

// All vehicle routes should be protected
router.use(authenticateToken);

router.post('/', addVehicle);
router.get('/', getMyVehicles);

export default router;
