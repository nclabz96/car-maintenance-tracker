// tests/vehicle.test.ts
import request from 'supertest';
import testApp from '../src/app'; // Assuming src/app.ts exports the app
import { usersDb, vehiclesDb } from '../src/database'; // For potential cleanup

const app = testApp;
let userToken = '';
let userId = ''; // Store the user's ID

// Helper to generate unique usernames for tests
const generateUniqueUsername = (prefix = 'testuser') => `${prefix}_${Date.now()}${Math.floor(Math.random() * 1000)}`;

beforeAll(async () => {
    // Clear relevant DBs before all tests in this suite
    await new Promise<void>(resolve => vehiclesDb.remove({}, { multi: true }, () => resolve()));
    await new Promise<void>(resolve => usersDb.remove({}, { multi: true }, () => resolve()));
    
    // Register and login a user to get a token
    const username = generateUniqueUsername('vehicleowner');
    const password = 'password123';
    
    const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username, password, role: 'user' });
    userId = regRes.body.user._id; // Capture userId

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username, password });
    userToken = loginRes.body.token;
});

afterAll(async () => {
    // Optional: Clean up database after all tests in this suite
    await new Promise<void>(resolve => vehiclesDb.remove({}, { multi: true }, () => resolve()));
    await new Promise<void>(resolve => usersDb.remove({}, { multi: true }, () => resolve()));
});


describe('Vehicle API', () => {
    let testVehicleId = '';

    // Test for adding a vehicle (from previous tests, ensure it runs first or independently)
    it('should add a new vehicle for an authenticated user', async () => {
        const res = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                make: 'TestMake',
                model: 'TestModel',
                year: 2023,
                current_mileage: 1000
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('vehicle');
        expect(res.body.vehicle.make).toEqual('TestMake');
        expect(res.body.vehicle.owner_id).toEqual(userId);
        testVehicleId = res.body.vehicle._id; // Save for subsequent tests
    });
    
    it('should list vehicles for the authenticated user', async () => {
        // Ensure a vehicle is added before listing (e.g. by the previous test)
        if (!testVehicleId) { // Or add one here if tests are independent
             const addRes = await request(app)
                .post('/api/vehicles')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ make: 'ListMake', model: 'ListModel', year: 2022, current_mileage: 500 });
             if(addRes.body.vehicle) testVehicleId = addRes.body.vehicle._id; // Use this if independent
        }

        const res = await request(app)
            .get('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        const foundVehicle = res.body.find(v => v._id === testVehicleId);
        expect(foundVehicle).toBeDefined();
    });

    it('should update an existing vehicle', async () => {
        expect(testVehicleId).toBeDefined(); // Ensure vehicleId is available
        const updatedData = {
            make: 'UpdatedMake',
            current_mileage: 1500
        };
        const res = await request(app)
            .put(`/api/vehicles/${testVehicleId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send(updatedData);
        expect(res.statusCode).toEqual(200);
        expect(res.body.vehicle.make).toEqual('UpdatedMake');
        expect(res.body.vehicle.current_mileage).toEqual(1500);
        // Model and year should remain unchanged
        expect(res.body.vehicle.model).toEqual('TestModel'); // Assuming from initial add
    });

    it('should not update a vehicle belonging to another user', async () => {
        // Register another user
        const otherUsername = generateUniqueUsername('otheruser');
        const otherPassword = 'password123';
        await request(app).post('/api/auth/register').send({ username: otherUsername, password: otherPassword, role: 'user' });
        const otherLoginRes = await request(app).post('/api/auth/login').send({ username: otherUsername, password: otherPassword });
        const otherUserToken = otherLoginRes.body.token;

        const res = await request(app)
            .put(`/api/vehicles/${testVehicleId}`) // testVehicleId belongs to 'userToken' user
            .set('Authorization', `Bearer ${otherUserToken}`)
            .send({ make: 'AnotherUpdate' });
        expect(res.statusCode).toEqual(404); // Or 403, depending on service logic (currently 404 if not found for user)
    });
    
    it('should delete an existing vehicle', async () => {
        expect(testVehicleId).toBeDefined();
        const res = await request(app)
            .delete(`/api/vehicles/${testVehicleId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.statusCode).toEqual(200); // Or 204 if no content is returned
        expect(res.body.message).toEqual('Vehicle deleted successfully');

        // Verify it's actually deleted
        const getRes = await request(app)
            .get('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`);
        const deletedVehicle = getRes.body.find(v => v._id === testVehicleId);
        expect(deletedVehicle).toBeUndefined();
    });
    
    it('should not delete a vehicle belonging to another user', async () => {
        // Create a vehicle for the main user first
        const addRes = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ make: 'AnotherVehicle', model: 'ToDelete', year: 2024, current_mileage: 100 });
        const vehicleToRemainId = addRes.body.vehicle._id;

        // Register and login another user
        const otherUsername = generateUniqueUsername('deleterUser');
        await request(app).post('/api/auth/register').send({ username: otherUsername, password: 'password123', role: 'user' });
        const otherLoginRes = await request(app).post('/api/auth/login').send({ username: otherUsername, password: 'password123' });
        const otherUserToken = otherLoginRes.body.token;

        // Attempt to delete main user's vehicle with other user's token
        const res = await request(app)
            .delete(`/api/vehicles/${vehicleToRemainId}`)
            .set('Authorization', `Bearer ${otherUserToken}`);
        expect(res.statusCode).toEqual(404); // Or 403

        // Verify vehicle still exists for the original owner
        const getRes = await request(app)
            .get('/api/vehicles')
            .set('Authorization', `Bearer ${userToken}`);
        const foundVehicle = getRes.body.find(v => v._id === vehicleToRemainId);
        expect(foundVehicle).toBeDefined();
    });
});
