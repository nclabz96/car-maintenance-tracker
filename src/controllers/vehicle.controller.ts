// Create src/controllers/vehicle.controller.ts
import { Response } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware'; // Use your actual path

const vehicleService = new VehicleService();

export const addVehicle = async (req: AuthenticatedRequest, res: Response) => {
    const { make, model, year, current_mileage } = req.body;
    const owner_id = req.user?.userId; // Extracted from token by authMiddleware

    if (!make || !model || !year || current_mileage === undefined) {
        return res.status(400).json({ message: 'Make, model, year, and current mileage are required' });
    }
    if (!owner_id) {
        return res.status(403).json({ message: 'User not authenticated' });
    }

    try {
        const newVehicle = await vehicleService.createVehicle(
            { make, model, year: parseInt(year), current_mileage: parseFloat(current_mileage) },
            owner_id
        );
        res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error adding vehicle', error: (error as Error).message });
    }
};

export const getMyVehicles = async (req: AuthenticatedRequest, res: Response) => {
    const owner_id = req.user?.userId;
    if (!owner_id) {
        return res.status(403).json({ message: 'User not authenticated' });
    }

    try {
        const vehicles = await vehicleService.getVehiclesByOwner(owner_id);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: (error as Error).message });
    }
};
