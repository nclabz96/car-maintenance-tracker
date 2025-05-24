"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = require("../services/user.service");
const config_1 = require("../config");
const database_1 = require("../database"); // Added for usersCount
const userService = new user_service_1.UserService();
const register = async (req, res) => {
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
        const passwordHash = await bcrypt_1.default.hash(password, config_1.BCRYPT_SALT_ROUNDS);
        let finalRole = userRole;
        const usersCount = await new Promise((resolve, reject) => {
            database_1.usersDb.count({}, (err, count) => err ? reject(err) : resolve(count));
        });
        if (usersCount === 0 && finalRole !== 'admin') { // Only make first user admin if they didn't specify admin
            finalRole = 'admin';
        }
        const newUser = await userService.registerUser({ username, passwordHash, role: finalRole });
        const userResponse = { _id: newUser._id, username: newUser.username, role: newUser.role };
        res.status(201).json({ message: 'User registered successfully', user: userResponse });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
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
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const tokenPayload = {
            userId: user._id,
            username: user.username,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(tokenPayload, config_1.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { _id: user._id, username: user.username, role: user.role },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};
exports.login = login;
