// src/services/vehicle.service.ts
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

    private findOneAsync(query: any): Promise<Vehicle | null> {
        return new Promise((resolve, reject) => {
            vehiclesDb.findOne(query, (err: Error | null, doc: Vehicle | null) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });
    }

    private updateAsync(query: any, update: any): Promise<number> { // NeDB update returns number of affected docs
        return new Promise((resolve, reject) => {
            vehiclesDb.update(query, update, {}, (err: Error | null, numReplaced: number) => {
                if (err) reject(err);
                else resolve(numReplaced);
            });
        });
    }

    private removeAsync(query: any): Promise<number> { // NeDB remove returns number of removed docs
        return new Promise((resolve, reject) => {
            vehiclesDb.remove(query, {}, (err: Error | null, numRemoved: number) => {
                if (err) reject(err);
                else resolve(numRemoved);
            });
        });
    }

    async createVehicle(vehicleData: Omit<Vehicle, '_id' | 'createdAt' | 'owner_id'>, owner_id: string): Promise<Vehicle> {
        return this.insertAsync({ ...vehicleData, owner_id });
    }

    async getVehiclesByOwner(owner_id: string): Promise<Vehicle[]> {
        return this.findAsync({ owner_id });
    }

    async getVehicleByIdAndOwner(vehicleId: string, owner_id: string): Promise<Vehicle | null> {
        return this.findOneAsync({ _id: vehicleId, owner_id });
    }

    async updateVehicle(
        vehicleId: string,
        owner_id: string,
        vehicleData: Partial<Omit<Vehicle, '_id' | 'owner_id' | 'createdAt'>>
    ): Promise<Vehicle | null> {
        const vehicle = await this.getVehicleByIdAndOwner(vehicleId, owner_id);
        if (!vehicle) {
            return null; // Or throw an error: not found or not authorized
        }

        // Ensure no restricted fields are part of vehicleData (though type system helps)
        const updatePayload = { $set: vehicleData };
        const numUpdated = await this.updateAsync({ _id: vehicleId, owner_id }, updatePayload);

        if (numUpdated > 0) {
            return this.getVehicleByIdAndOwner(vehicleId, owner_id); // Return updated document
        }
        return null; // Should not happen if vehicle was found initially
    }

    async deleteVehicle(vehicleId: string, owner_id: string): Promise<boolean> {
        const numRemoved = await this.removeAsync({ _id: vehicleId, owner_id });
        return numRemoved > 0;
    }
}
