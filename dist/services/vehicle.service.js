"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
// Create src/services/vehicle.service.ts
const database_1 = require("../database");
class VehicleService {
    insertAsync(doc) {
        return new Promise((resolve, reject) => {
            const vehicleToInsert = { ...doc, createdAt: new Date() };
            database_1.vehiclesDb.insert(vehicleToInsert, (err, newDoc) => {
                if (err)
                    reject(err);
                else
                    resolve(newDoc);
            });
        });
    }
    findAsync(query) {
        return new Promise((resolve, reject) => {
            database_1.vehiclesDb.find(query).sort({ createdAt: -1 }).exec((err, docs) => {
                if (err)
                    reject(err);
                else
                    resolve(docs);
            });
        });
    }
    async createVehicle(vehicleData, owner_id) {
        return this.insertAsync({ ...vehicleData, owner_id });
    }
    async getVehiclesByOwner(owner_id) {
        return this.findAsync({ owner_id });
    }
}
exports.VehicleService = VehicleService;
