// Create src/controllers/maintenance.controller.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { MaintenanceService } from '../services/maintenance.service';

const maintenanceService = new MaintenanceService();

export const addMaintenanceRecordHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const owner_id = req.user?.userId;
    const { vehicleId } = req.params;
    const { date, mileage, repair_type, cost, location, notes } = req.body;

    if (!owner_id) {
        res.status(403).json({ message: 'User not authenticated' });
        return;
    }
    if (!date || mileage === undefined || !repair_type || cost === undefined) {
        res.status(400).json({ message: 'Date, mileage, repair type, and cost are required' });
        return;
    }

    try {
        const record = await maintenanceService.addMaintenanceRecord(
            { date, mileage: parseFloat(mileage), repair_type, cost: parseFloat(cost), location, notes },
            vehicleId,
            owner_id
        );
        if (!record) {
            res.status(404).json({ message: 'Vehicle not found or not authorized' });
            return;
        }
        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: 'Error adding maintenance record', error: (error as Error).message });
    }
};

export const getMaintenanceRecordsHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const owner_id = req.user?.userId;
    const { vehicleId } = req.params;

    if (!owner_id) {
        res.status(403).json({ message: 'User not authenticated' });
        return;
    }
    try {
        const records = await maintenanceService.getMaintenanceRecordsForVehicle(vehicleId, owner_id);
        if (records === null) { // Check for null which indicates vehicle not found/unauthorized
            res.status(404).json({ message: 'Vehicle not found or not authorized' });
            return;
        }
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching maintenance records', error: (error as Error).message });
    }
};

export const updateMaintenanceRecordHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const owner_id = req.user?.userId;
    const { vehicleId, recordId } = req.params;
    const updates = req.body; // { date, mileage, repair_type, cost, location, notes }

    if (!owner_id) {
        res.status(403).json({ message: 'User not authenticated' });
        return;
    }
    if (Object.keys(updates).length === 0) {
        res.status(400).json({ message: 'No update data provided' });
        return;
    }
    // Ensure types for specific fields if necessary, e.g., mileage, cost
    if (updates.mileage !== undefined) updates.mileage = parseFloat(updates.mileage);
    if (updates.cost !== undefined) updates.cost = parseFloat(updates.cost);


    try {
        const updatedRecord = await maintenanceService.updateMaintenanceRecord(recordId, vehicleId, owner_id, updates);
        if (!updatedRecord) {
            res.status(404).json({ message: 'Maintenance record not found, or vehicle not found/authorized' });
            return;
        }
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: 'Error updating maintenance record', error: (error as Error).message });
    }
};

export const deleteMaintenanceRecordHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const owner_id = req.user?.userId;
    const { vehicleId, recordId } = req.params;

    if (!owner_id) {
        res.status(403).json({ message: 'User not authenticated' });
        return;
    }
    try {
        const success = await maintenanceService.deleteMaintenanceRecord(recordId, vehicleId, owner_id);
        if (!success) {
            res.status(404).json({ message: 'Maintenance record not found, or vehicle not found/authorized' });
            return;
        }
        res.status(200).json({ message: 'Maintenance record deleted successfully' }); // Or 204 No Content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting maintenance record', error: (error as Error).message });
    }
};
