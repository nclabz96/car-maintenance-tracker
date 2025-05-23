import express from 'express';
import path from 'path';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes'; // Ensure this is imported
import { authenticateToken, authorizeRole, AuthenticatedRequest } from './middleware/auth.middleware'; // Ensure this is imported

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

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

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes); // Make sure this line exists and is correct

// Example protected route for authenticated users
app.get('/api/profile', authenticateToken, (req: AuthenticatedRequest, res: express.Response): void => {
    // req.user is available here
    res.json({ message: 'This is a protected profile route', user: req.user });
});

// Example protected route for admin users only
app.get('/api/admin/dashboard', authenticateToken, authorizeRole(['admin']), (req: AuthenticatedRequest, res: express.Response): void => {
    res.json({ message: 'Welcome to the Admin Dashboard', user: req.user });
});

export default app;
