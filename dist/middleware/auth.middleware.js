"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.sendStatus(401); // Unauthorized
        return; // Explicit return for void
    }
    jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('JWT verification error:', err);
            res.sendStatus(403); // Forbidden - token is no longer valid
            return; // Explicit return for void
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// Role authorization middleware
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: Insufficient role privileges' });
            return; // Explicit return for void
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
