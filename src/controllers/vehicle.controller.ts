// src/controllers/vehicle.controller.ts
import { Response } from 'express';
import { VehicleService } from '../services/vehicle.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Vehicle } from '../models/vehicle.model'; // Import Vehicle model for type casting

const vehicleService = new VehicleService();

export const addVehicle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { make, model, year, current_mileage } = req.body;
    const owner_id = req.user?.userId;

    if (!make || !model || !year || current_mileage === undefined) {
        res.status(400).json({ message: 'Make, model, year, and current mileage are required' });
        return;
    }
    if (!owner_id) {
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

export const updateVehicleHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const owner_id = req.user?.userId;
    const vehicleId = req.params.vehicleId;
    const { make, model, year, current_mileage } = req.body;

    if (!owner_id) {
        res.status(403).json({ message: 'User not authenticated' });
        return;
    }
    if (!vehicleId) {
        res.status(400).json({ message: 'Vehicle ID is required' });
        return;
    }
    if (make === undefined && model === undefined && year === undefined && current_mileage === undefined) {
        res.status(400).json({ message: 'At least one field to update is required' });
        return;
    }
    
    // Construct the update payload carefully
    const vehicleDataToUpdate: Partial<Omit<Vehicle, '_id' | 'owner_id' | 'createdAt'>> = {};
    if (make !== undefined) vehicleDataToUpdate.make = make;
    if (model !== undefined) vehicleDataToUpdate.model = model;
    if (year !== undefined) vehicleDataToUpdate.year = parseInt(year as string);
    if (current_mileage !== undefined) vehicleDataToUpdate.current_mileage = parseFloat(current_mileage as string);


    try {
        const updatedVehicle = await vehicleService.updateVehicle(vehicleId, owner_id, vehicleDataToUpdate);
        if (!updatedVehicle) {
            res.status(404).json({ message: 'Vehicle not found or not authorized to update' });
            return;
        }
        res.status(200).json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
    } catch (error) {
        res.status(500).json({ message: 'Error updating vehicle', error: (error as Error).message });
    }
};

export const deleteVehicleHandler = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const owner_id = req.user?.userId;
    const vehicleId = req.params.vehicleId;

    if (!owner_id) {
        res.status(403).json({ message: 'User not authenticated' });
        return;
    }
    if (!vehicleId) {
        res.status(400).json({ message: 'Vehicle ID is required' });
        return;
    }

    try {
        const success = await vehicleService.deleteVehicle(vehicleId, owner_id);
        if (!success) {
            res.status(404).json({ message: 'Vehicle not found or not authorized to delete' });
            return;
        }
        res.status(200).json({ message: 'Vehicle deleted successfully' }); // Consider 204 No Content
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle', error: (error as Error).message });
    }
};
