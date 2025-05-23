// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/user.service';
import { JWT_SECRET, BCRYPT_SALT_ROUNDS } from '../config';
import { usersDb } from '../database'; // Added for usersCount

const userService = new UserService();

export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
    }
    
    const allowedRoles = ['user', 'admin'];
    const userRole = role && allowedRoles.includes(role) ? role : 'user';

    try {
        const existingUser = await userService.findByUsername(username);
        if (existingUser) {
            res.status(409).json({ message: 'Username already exists' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        
        let finalRole: 'admin' | 'user' = userRole;
        const usersCount = await new Promise<number>((resolve, reject) => {
             usersDb.count({}, (err, count) => err ? reject(err) : resolve(count));
        });
        if (usersCount === 0 && finalRole !== 'admin') { // Only make first user admin if they didn't specify admin
             finalRole = 'admin';
        }


        const newUser = await userService.registerUser({ username, passwordHash, role: finalRole });
        const userResponse = { _id: newUser._id, username: newUser.username, role: newUser.role };
        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
    }

    try {
        const user = await userService.findByUsername(username);
        if (!user || !user.passwordHash) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const tokenPayload = {
            userId: user._id,
            username: user.username,
            role: user.role,
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { _id: user._id, username: user.username, role: user.role },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: (error as Error).message });
    }
};
