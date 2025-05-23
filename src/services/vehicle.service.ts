// Create src/services/vehicle.service.ts
import { vehiclesDb } from '../database';
import { Vehicle } from '../models/vehicle.model';

export class VehicleService {
    private insertAsync(doc: Omit<Vehicle, '_id' | 'createdAt'> & { owner_id: string }): Promise<Vehicle> {
        return new Promise((resolve, reject) => {
            const vehicleToInsert = { ...doc, createdAt: new Date() };
            vehiclesDb.insert(vehicleToInsert, (err: Error | null, newDoc: Vehicle) => {
                if (err) reject(err);
                else resolve(newDoc);
            });
        });
    }

    private findAsync(query: any): Promise<Vehicle[]> {
        return new Promise((resolve, reject) => {
            vehiclesDb.find(query).sort({ createdAt: -1 }).exec((err: Error | null, docs: Vehicle[]) => {
                if (err) reject(err);
                else resolve(docs);
            });
        });
    }

    async createVehicle(vehicleData: Omit<Vehicle, '_id' | 'createdAt' | 'owner_id'>, owner_id: string): Promise<Vehicle> {
        return this.insertAsync({ ...vehicleData, owner_id });
    }

    async getVehiclesByOwner(owner_id: string): Promise<Vehicle[]> {
        return this.findAsync({ owner_id });
    }
}
