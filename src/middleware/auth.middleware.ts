// src/middleware/auth.middleware.ts
import { Response, NextFunction, Request as ExpressRequest } from 'express'; // Import NextFunction and ExpressRequest
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { User } from '../models/user.model';
// Removed self-reference: import { AuthenticatedRequest } from './auth.middleware'; 

// Define AuthenticatedRequest here, extending ExpressRequest
export interface AuthenticatedRequest extends ExpressRequest {
    user?: User & { userId: string }; // Add userId for convenience
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.sendStatus(401); // Unauthorized
        return; // Explicit return for void
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            console.error('JWT verification error:', err);
            res.sendStatus(403); // Forbidden - token is no longer valid
            return; // Explicit return for void
        }
        req.user = decoded as User & { userId: string };
        next();
    });
};

// Role authorization middleware
export const authorizeRole = (allowedRoles: Array<User['role']>) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: 'Forbidden: Insufficient role privileges' });
            return; // Explicit return for void
        }
        next();
    };
};
