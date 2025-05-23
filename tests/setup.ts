// tests/setup.ts
// This file can be used for global setup, like clearing the database before tests.
// For NeDB, this might involve deleting the .db files or specific test data.
import { usersDb, vehiclesDb, maintenanceDb, fuelDb } from '../src/database'; // Adjust path as needed
import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '..', 'src', 'data'); // Path to data files from src/database.ts

const clearDatabase = () => {
    return new Promise<void>((resolve, reject) => {
        // Close DB connections if NeDB holds them open, then delete files
        // NeDB autoloads, so simply deleting files should work before tests run if server isn't running
        // Or, use db.remove({}, { multi: true })
        const dbFiles = [
            path.join(dataDir, 'users.db'),
            path.join(dataDir, 'vehicles.db'),
            path.join(dataDir, 'maintenance.db'),
            path.join(dataDir, 'fuel.db')
        ];

        dbFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });

        // Re-initialize DBs for a clean state for each test suite if needed,
        // or rely on autoload: true to recreate them.
        // For simplicity, we'll rely on autoload.
        // Ensure data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Re-init dbs by requiring them (this might not be ideal, better to export a reset function from database.ts)
        // For now, we assume jest runs tests in separate processes or NeDB handles file creation gracefully.
        // A more robust solution would be to have an exported reset function from database.ts
        // or use specific test databases.
        usersDb.loadDatabase();
        vehiclesDb.loadDatabase();
        // maintenanceDb.loadDatabase(); // if needed
        // fuelDb.loadDatabase(); // if needed

        resolve();
    });
};

beforeAll(async () => {
    // Clear database before all tests run in a suite
    // This simple file deletion is okay for NeDB if tests run sequentially or if each test file targets different data.
    // For parallel tests or more complex scenarios, more robust data isolation is needed.
    await clearDatabase();
});

afterEach(async () => {
    // Optional: Clear after each test if tests interfere with each other
    // await clearDatabase();

// Ensures that NeDB has time to write to disk before Jest exits
// afterAll((done) => {
    // Give some time for DB operations to complete. This is a workaround.
    // A better solution would be to ensure all DB write operations are properly promisified and awaited.
//    setTimeout(done, 500);
// });
// Removing the afterAll hook with setTimeout as it might not be necessary
// and can hide issues with asynchronous operations not completing.
// Proper promisification and async/await should be used in services and tests.

// Ensures that NeDB has time to write to disk before Jest exits
afterAll((done) => {
    // Give some time for DB operations to complete. This is a workaround.
    // A better solution would be to ensure all DB write operations are properly promisified and awaited.
    setTimeout(done, 500);
});
