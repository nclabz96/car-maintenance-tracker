// tests/vehicle.test.ts
import request from 'supertest';
import testApp from '../src/app'; // Assuming src/app.ts exports the app

const app = testApp;
let authToken = '';
let testUserId = '';

// Helper to generate unique usernames for tests
const generateUniqueUsername = () => `vehicleuser_${Date.now()}${Math.floor(Math.random() * 1000)}`;


beforeAll(async () => {
    // Register and login a user to get a token for vehicle tests
    const username = generateUniqueUsername();
    const password = 'password123';
    
    const regRes = await request(app)
        .post('/api/auth/register')
        .send({ username, password, role: 'user' });
    testUserId = regRes.body.user._id;

    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username, password });
    authToken = loginRes.body.token;
});

describe('Vehicle API', () => {
    it('should not allow access to vehicle routes without a token', async () => {
        const res = await request(app)
            .get('/api/vehicles');
        expect(res.statusCode).toEqual(401); // Unauthorized
    });

    it('should add a new vehicle for an authenticated user', async () => {
        const res = await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                make: 'TestMake',
                model: 'TestModel',
                year: 2023,
                current_mileage: 1000
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('vehicle');
        expect(res.body.vehicle.make).toEqual('TestMake');
        expect(res.body.vehicle.owner_id).toEqual(testUserId);
    });

    it('should list vehicles for the authenticated user', async () => {
        // Add a vehicle first
        await request(app)
            .post('/api/vehicles')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ make: 'ListMake', model: 'ListModel', year: 2022, current_mileage: 500 });

        const res = await request(app)
            .get('/api/vehicles')
            .set('Authorization', `Bearer ${authToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
        // Check if the list is not empty, it could have vehicles from previous tests if DB is not cleared per test
        const foundVehicle = res.body.find(v => v.make === 'ListMake' && v.owner_id === testUserId);
        expect(foundVehicle).toBeDefined();
        expect(foundVehicle.owner_id).toEqual(testUserId);
    });
});
