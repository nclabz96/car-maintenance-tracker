// Create src/routes/maintenance.routes.ts
import { Router } from 'express';
import {
    addMaintenanceRecordHandler,
    getMaintenanceRecordsHandler,
    updateMaintenanceRecordHandler,
    deleteMaintenanceRecordHandler
} from '../controllers/maintenance.controller';
// Note: No need to import authenticateToken here if the parent vehicle router already uses it for all its routes.
// However, if vehicle routes can be accessed without auth, then maintenance routes should re-apply it.
// Assuming vehicle routes are already protected by authenticateToken.

// mergeParams: true allows access to params from parent router (e.g., :vehicleId)
const router = Router({ mergeParams: true });

// POST /api/vehicles/:vehicleId/maintenance
router.post('/', addMaintenanceRecordHandler);

// GET /api/vehicles/:vehicleId/maintenance
router.get('/', getMaintenanceRecordsHandler);

// PUT /api/vehicles/:vehicleId/maintenance/:recordId
router.put('/:recordId', updateMaintenanceRecordHandler);

// DELETE /api/vehicles/:vehicleId/maintenance/:recordId
router.delete('/:recordId', deleteMaintenanceRecordHandler);

export default router;
