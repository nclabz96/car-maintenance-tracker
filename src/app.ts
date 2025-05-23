import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import { authenticateToken, authorizeRole, AuthenticatedRequest } from './middleware/auth.middleware';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Example protected routes (can be moved to their own route files if they grow)
app.get('/api/profile', authenticateToken, (req: AuthenticatedRequest, res) => {
    res.json({ message: 'This is a protected profile route', user: req.user });
});

app.get('/api/admin/dashboard', authenticateToken, authorizeRole(['admin']), (req: AuthenticatedRequest, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard', user: req.user });
});

// Simple root route
app.get('/', (req, res) => {
    // This will typically serve your main HTML page if not handled by static middleware for '/'
    // For a SPA, this might always serve index.html if no other route matches.
    // If public/index.html exists, express.static will serve it for '/'.
    // If you want to explicitly send a message for API root:
    if (req.accepts('html')) {
        // Let static serve index.html or handle as you wish
        // For now, this is fine. If public/index.html is login, it will be served.
    } else {
        res.send('Maintenance Tracker API is running.');
    }
});

export default app;
