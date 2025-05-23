// Create this file: src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { JWT_SECRET, BCRYPT_SALT_ROUNDS } from '../config';
import { User } from '../models/user.model';
import { usersDb } from '../database'; // Import usersDb

const userService = new UserService();

export const register = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Basic validation for role
    const allowedRoles = ['user', 'admin'];
    const userRole = role && allowedRoles.includes(role) ? role : 'user';

    try {
        const existingUser = await userService.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        
        // For simplicity, first registered user is an admin, others are users.
        // This is a placeholder logic. Proper admin creation should be handled differently.
        let finalRole: 'admin' | 'user' = userRole;
        const usersCount = await new Promise<number>((resolve, reject) => {
             usersDb.count({}, (err, count) => err ? reject(err) : resolve(count));
        });
        if (usersCount === 0) {
            finalRole = 'admin';
        }


        const newUser = await userService.registerUser({ username, passwordHash, role: finalRole });
        
        // Exclude password from the response
        const userResponse = { _id: newUser._id, username: newUser.username, role: newUser.role };

        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await userService.findByUsername(username);
        if (!user || !user.passwordHash) { // Check for user.passwordHash as well
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokenPayload = {
            userId: user._id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
    }
};
