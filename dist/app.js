"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const vehicle_routes_1 = __importDefault(require("./routes/vehicle.routes")); // Ensure this is imported
const auth_middleware_1 = require("./middleware/auth.middleware"); // Ensure this is imported
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
    // This will typically serve your main HTML page if not handled by static middleware for '/'
    // For a SPA, this might always serve index.html if no other route matches.
    // If public/index.html exists, express.static will serve it for '/'.
    // If you want to explicitly send a message for API root:
    if (req.accepts('html')) {
        // Let static serve index.html or handle as you wish
        // For now, this is fine. If public/index.html is login, it will be served.
    }
    else {
        res.send('Maintenance Tracker API is running.');
    }
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/vehicles', vehicle_routes_1.default); // Make sure this line exists and is correct
// Example protected route for authenticated users
app.get('/api/profile', auth_middleware_1.authenticateToken, (req, res) => {
    // req.user is available here
    res.json({ message: 'This is a protected profile route', user: req.user });
});
// Example protected route for admin users only
app.get('/api/admin/dashboard', auth_middleware_1.authenticateToken, (0, auth_middleware_1.authorizeRole)(['admin']), (req, res) => {
    res.json({ message: 'Welcome to the Admin Dashboard', user: req.user });
});
exports.default = app;
