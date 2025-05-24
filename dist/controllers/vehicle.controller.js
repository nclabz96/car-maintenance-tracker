"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyVehicles = exports.addVehicle = void 0;
const vehicle_service_1 = require("../services/vehicle.service");
const vehicleService = new vehicle_service_1.VehicleService();
const addVehicle = async (req, res) => {
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
        const newVehicle = await vehicleService.createVehicle({ make, model, year: parseInt(year), current_mileage: parseFloat(current_mileage) }, owner_id);
        res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding vehicle', error: error.message });
    }
};
exports.addVehicle = addVehicle;
const getMyVehicles = async (req, res) => {
    const owner_id = req.user?.userId;
    if (!owner_id) {
        // This check might be redundant
        res.status(403).json({ message: 'User not authenticated properly' });
        return;
    }
    try {
        const vehicles = await vehicleService.getVehiclesByOwner(owner_id);
        res.status(200).json(vehicles);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles', error: error.message });
    }
};
exports.getMyVehicles = getMyVehicles;
