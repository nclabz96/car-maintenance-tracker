"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Create src/routes/vehicle.routes.ts
const express_1 = require("express");
const vehicle_controller_1 = require("../controllers/vehicle.controller");
const auth_middleware_1 = require("../middleware/auth.middleware"); // Use your actual path
const router = (0, express_1.Router)();
// All vehicle routes should be protected
router.use(auth_middleware_1.authenticateToken);
router.post('/', vehicle_controller_1.addVehicle);
router.get('/', vehicle_controller_1.getMyVehicles);
exports.default = router;
