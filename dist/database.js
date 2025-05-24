"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fuelDb = exports.maintenanceDb = exports.vehiclesDb = exports.usersDb = void 0;
const nedb_1 = __importDefault(require("nedb"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dataDir = path_1.default.join(__dirname, '..', 'data'); // Adjust path if needed, e.g. relative to project root
// Ensure data directory exists
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
const usersDb = new nedb_1.default({ filename: path_1.default.join(dataDir, 'users.db'), autoload: true });
exports.usersDb = usersDb;
const vehiclesDb = new nedb_1.default({ filename: path_1.default.join(dataDir, 'vehicles.db'), autoload: true });
exports.vehiclesDb = vehiclesDb;
const maintenanceDb = new nedb_1.default({ filename: path_1.default.join(dataDir, 'maintenance.db'), autoload: true });
exports.maintenanceDb = maintenanceDb;
const fuelDb = new nedb_1.default({ filename: path_1.default.join(dataDir, 'fuel.db'), autoload: true });
exports.fuelDb = fuelDb;
