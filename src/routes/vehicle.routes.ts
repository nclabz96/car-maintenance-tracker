// src/routes/vehicle.routes.ts
import { Router } from 'express';
import { addVehicle, getMyVehicles, updateVehicleHandler, deleteVehicleHandler } from '../controllers/vehicle.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import maintenanceRoutes from './maintenance.routes'; // Import maintenance routes

const router = Router();

router.use(authenticateToken); // Protect all vehicle routes (and by extension, nested maintenance routes)

router.post('/', addVehicle);
router.get('/', getMyVehicles);
router.put('/:vehicleId', updateVehicleHandler);
router.delete('/:vehicleId', deleteVehicleHandler);

// Nest maintenance routes under /:vehicleId/maintenance
router.use('/:vehicleId/maintenance', maintenanceRoutes);

export default router;
