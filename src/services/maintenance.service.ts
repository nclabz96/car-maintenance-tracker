// Create src/services/maintenance.service.ts
import { maintenanceDb, vehiclesDb } from '../database'; // Assuming vehiclesDb might be needed for checks
import { MaintenanceRecord } from '../models/maintenance.model';
import { VehicleService } from './vehicle.service'; // To check vehicle ownership

const vehicleService = new VehicleService(); // Instantiate for use

export class MaintenanceService {
    // Private helper to find a single maintenance record by its ID and vehicle ID
    private async findOneRecordAsync(recordId: string, vehicleId: string): Promise<MaintenanceRecord | null> {
        return new Promise((resolve, reject) => {
            maintenanceDb.findOne({ _id: recordId, vehicle_id: vehicleId }, (err: Error | null, doc: MaintenanceRecord | null) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });
    }

    async addMaintenanceRecord(
        recordData: Omit<MaintenanceRecord, '_id' | 'createdAt' | 'vehicle_id'>,
        vehicle_id: string,
        owner_id: string
    ): Promise<MaintenanceRecord | null> {
        // Verify the vehicle exists and belongs to the owner
        const vehicle = await vehicleService.getVehicleByIdAndOwner(vehicle_id, owner_id);
        if (!vehicle) {
            console.log(`Vehicle not found or user ${owner_id} does not own vehicle ${vehicle_id}`);
            return null; // Or throw an error indicating vehicle not found or unauthorized
        }

        const newRecord: Omit<MaintenanceRecord, '_id'> = {
            ...recordData,
            vehicle_id,
            date: new Date(recordData.date), // Ensure date is stored as Date object
            createdAt: new Date()
        };

        return new Promise((resolve, reject) => {
            maintenanceDb.insert(newRecord, (err: Error | null, doc: MaintenanceRecord) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });
    }

    async getMaintenanceRecordsForVehicle(vehicle_id: string, owner_id: string): Promise<MaintenanceRecord[] | null> {
        const vehicle = await vehicleService.getVehicleByIdAndOwner(vehicle_id, owner_id);
        if (!vehicle) {
            return null; // Vehicle not found or user not authorized
        }

        return new Promise((resolve, reject) => {
            maintenanceDb.find({ vehicle_id }).sort({ date: -1, createdAt: -1 }).exec((err: Error | null, docs: MaintenanceRecord[]) => {
                if (err) reject(err);
                else resolve(docs);
            });
        });
    }

    async updateMaintenanceRecord(
        recordId: string,
        vehicle_id: string,
        owner_id: string,
        updates: Partial<Omit<MaintenanceRecord, '_id' | 'vehicle_id' | 'createdAt'>>
    ): Promise<MaintenanceRecord | null> {
        const vehicle = await vehicleService.getVehicleByIdAndOwner(vehicle_id, owner_id);
        if (!vehicle) {
            return null; // Vehicle not found or user not authorized
        }

        // Ensure the record exists for that vehicle
        const existingRecord = await this.findOneRecordAsync(recordId, vehicle_id);
        if (!existingRecord) {
            return null; // Record not found for this vehicle
        }
        
        if (updates.date) {
            updates.date = new Date(updates.date); // Ensure date is stored as Date object
        }

        const updatePayload = { $set: updates };
        return new Promise((resolve, reject) => {
            maintenanceDb.update({ _id: recordId, vehicle_id }, updatePayload, {}, async (err, numReplaced) => {
                if (err) reject(err);
                else if (numReplaced === 0) resolve(null);
                else {
                    const updatedDoc = await this.findOneRecordAsync(recordId, vehicle_id);
                    resolve(updatedDoc);
                }
            });
        });
    }

    async deleteMaintenanceRecord(recordId: string, vehicle_id: string, owner_id: string): Promise<boolean> {
        const vehicle = await vehicleService.getVehicleByIdAndOwner(vehicle_id, owner_id);
        if (!vehicle) {
            return false; // Vehicle not found or user not authorized
        }
        
        // Ensure the record exists for that vehicle before attempting delete
        const existingRecord = await this.findOneRecordAsync(recordId, vehicle_id);
        if (!existingRecord) {
            return false; // Record not found
        }

        return new Promise((resolve, reject) => {
            maintenanceDb.remove({ _id: recordId, vehicle_id }, {}, (err, numRemoved) => {
                if (err) reject(err);
                else resolve(numRemoved > 0);
            });
        });
    }
}
