// Create this file: src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { User } from '../models/user.model'; // For typing the decoded payload

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
    user?: User & { userId: string }; // Add userId for convenience if it's different from _id or _id is optional
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.sendStatus(403); // Forbidden - token is no longer valid
        }
        req.user = decoded as User & { userId: string };
        next();
    });
};

// Role authorization middleware
export const authorizeRole = (allowedRoles: Array<User['role']>) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role privileges' });
        }
        next();
    };
};
