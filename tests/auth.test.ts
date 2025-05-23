// tests/auth.test.ts
import request from 'supertest';
// import express from 'express'; // For app type if you import the actual app
// Assuming your Express app instance is exported from src/index.ts or a similar file.
// This is often tricky. A common pattern is to have an app.ts that exports the app,
// and index.ts imports it and starts the server.
// For this subtask, we'll assume the worker can figure out how to get the 'app' instance.
// If not, the app setup from src/index.ts might need to be refactored to export 'app'.
// Let's try to create the app instance within the test file for simplicity,
// replicating the setup from src/index.ts without starting the server.

// Simplified app setup for testing (avoids starting server & port conflicts)
import testApp from '../src/app'; // Assume you create src/app.ts that exports the app

const app = testApp; // Use the imported app

// Helper to generate unique usernames for tests
const generateUniqueUsername = () => `testuser_${Date.now()}${Math.floor(Math.random() * 1000)}`;

describe('Auth API', () => {
    let testUsername = generateUniqueUsername();
    const testPassword = 'password123';

    beforeEach(() => {
        // Potentially re-generate username if tests need complete isolation and don't clean up users
        testUsername = generateUniqueUsername();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: testUsername,
                password: testPassword,
                role: 'user'
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user.username).toEqual(testUsername);
    });

    it('should not register an existing user', async () => {
        // First registration
        await request(app)
            .post('/api/auth/register')
            .send({ username: testUsername, password: testPassword, role: 'user' });
        
        // Attempt to register again
        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: testUsername, password: testPassword, role: 'user' });
        expect(res.statusCode).toEqual(409); // Conflict
        expect(res.body).toHaveProperty('message', 'Username already exists');
    });

    it('should login an existing user', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ username: testUsername, password: testPassword, role: 'user' });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUsername, password: testPassword });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.username).toEqual(testUsername);
    });

    it('should not login with incorrect password', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ username: testUsername, password: testPassword, role: 'user' });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUsername, password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
});
