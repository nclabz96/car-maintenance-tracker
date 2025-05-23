import Datastore from 'nedb';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '..', 'data'); // Adjust path if needed, e.g. relative to project root

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const usersDb = new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true });
const vehiclesDb = new Datastore({ filename: path.join(dataDir, 'vehicles.db'), autoload: true });
const maintenanceDb = new Datastore({ filename: path.join(dataDir, 'maintenance.db'), autoload: true });
const fuelDb = new Datastore({ filename: path.join(dataDir, 'fuel.db'), autoload: true });

export { usersDb, vehiclesDb, maintenanceDb, fuelDb };
