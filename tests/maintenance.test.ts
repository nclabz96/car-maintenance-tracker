// Create tests/maintenance.test.ts
import request from 'supertest';
import testApp from '../src/app';
import { usersDb, vehiclesDb, maintenanceDb } from '../src/database'; // For cleanup

const app = testApp;
let userToken = '';
let testVehicleId = '';
let userId = '';

const generateUniqueUsername = (prefix = 'maint_user') => `${prefix}_${Date.now()}${Math.floor(Math.random() * 1000)}`;

beforeAll(async () => {
    // Clear DBs
    await Promise.all([
        new Promise<void>(resolve => maintenanceDb.remove({}, { multi: true }, () => resolve())),
        new Promise<void>(resolve => vehiclesDb.remove({}, { multi: true }, () => resolve())),
        new Promise<void>(resolve => usersDb.remove({}, { multi: true }, () => resolve()))
    ]);

    // Register a user
    const username = generateUniqueUsername();
    const password = 'password123';
    const regRes = await request(app).post('/api/auth/register').send({ username, password, role: 'user' });
    userId = regRes.body.user._id;

    // Login user
    const loginRes = await request(app).post('/api/auth/login').send({ username, password });
    userToken = loginRes.body.token;

    // Create a vehicle for this user
    const vehicleRes = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ make: 'MaintTestCar', model: 'ModelX', year: 2021, current_mileage: 15000 });
    testVehicleId = vehicleRes.body.vehicle._id;
});

afterAll(async () => {
    // Optional: Clean up database after all tests in this suite
    await Promise.all([
        new Promise<void>(resolve => maintenanceDb.remove({}, { multi: true }, () => resolve())),
        new Promise<void>(resolve => vehiclesDb.remove({}, { multi: true }, () => resolve())),
        new Promise<void>(resolve => usersDb.remove({}, { multi: true }, () => resolve()))
    ]);
});

describe('Maintenance API', () => {
    let testRecordId = '';

    it('should add a maintenance record to a vehicle', async () => {
        const res = await request(app)
            .post(`/api/vehicles/${testVehicleId}/maintenance`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                date: new Date().toISOString(),
                mileage: 15500,
                repair_type: 'Oil Change',
                cost: 75.99,
                notes: 'Synthetic oil used.'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.repair_type).toEqual('Oil Change');
        expect(res.body.vehicle_id).toEqual(testVehicleId);
        testRecordId = res.body._id;
    });

    it('should get maintenance records for a vehicle', async () => {
        const res = await request(app)
            .get(`/api/vehicles/${testVehicleId}/maintenance`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        const foundRecord = res.body.find(r => r._id === testRecordId);
        expect(foundRecord).toBeDefined();
        expect(foundRecord.repair_type).toEqual('Oil Change');
    });

    it('should update a maintenance record', async () => {
        const updatedData = {
            cost: 80.50,
            notes: 'Synthetic oil used and tire rotation.'
        };
        const res = await request(app)
            .put(`/api/vehicles/${testVehicleId}/maintenance/${testRecordId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updatedData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.cost).toEqual(80.50);
        expect(res.body.notes).toEqual('Synthetic oil used and tire rotation.');
    });

    it('should not allow updating maintenance for a vehicle not owned by user', async () => {
        // Create another user and vehicle
        const otherUser = generateUniqueUsername('other');
        await request(app).post('/api/auth/register').send({ username: otherUser, password: 'password123', role: 'user' });
        const otherLogin = await request(app).post('/api/auth/login').send({ username: otherUser, password: 'password123' });
        const otherToken = otherLogin.body.token;
        const otherVehicleRes = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ make: 'OtherCar', model: 'OtherModel', year: 2020, current_mileage: 1000 });
        // const otherVehicleId = otherVehicleRes.body.vehicle._id; // Not needed for this test logic
        
        // Attempt to update original user's maintenance record using other user's token but correct vehicle ID for record
        const res = await request(app)
            .put(`/api/vehicles/${testVehicleId}/maintenance/${testRecordId}`) // Original vehicleId and recordId
            .set('Authorization', `Bearer ${otherToken}`) // But other user's token
            .send({ cost: 99 });
        // This should fail because otherToken's user does not own testVehicleId
        expect(res.statusCode).toEqual(404); // Or 403 - service returns null which controller turns to 404
    });


    it('should delete a maintenance record', async () => {
        const res = await request(app)
            .delete(`/api/vehicles/${testVehicleId}/maintenance/${testRecordId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200); // Or 204
        expect(res.body.message).toEqual('Maintenance record deleted successfully');

        // Verify it's deleted
        const getRes = await request(app)
            .get(`/api/vehicles/${testVehicleId}/maintenance`)
            .set('Authorization', `Bearer ${userToken}`);
        const deletedRecord = getRes.body.find(r => r._id === testRecordId);
        expect(deletedRecord).toBeUndefined();
    });
});
