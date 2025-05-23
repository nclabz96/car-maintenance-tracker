// src/controllers/vehicle.controller.ts
import { Response } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const vehicleService = new VehicleService();

export const addVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { make, model, year, current_mileage } = req.body;
    const owner_id = req.user?.userId;

    if (!make || !model || !year || current_mileage === undefined) {
        res.status(400).json({ message: 'Make, model, year, and current mileage are required' });
        return;
    }
    if (!owner_id) {
        // This check might be redundant if authenticateToken always sets req.user or denies access
        res.status(403).json({ message: 'User not authenticated properly' });
        return;
    }

    try {
        const newVehicle = await vehicleService.createVehicle(
            { make, model, year: parseInt(year as string), current_mileage: parseFloat(current_mileage as string) },
            owner_id
        );
        res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error adding vehicle', error: (error as Error).message });
    }
};

export const getMyVehicles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const owner_id = req.user?.userId;
    if (!owner_id) {
         // This check might be redundant
        res.status(403).json({ message: 'User not authenticated properly' });
        return;
    }

    try {
        const vehicles = await vehicleService.getVehiclesByOwner(owner_id);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: (error as Error).message });
    }
};
