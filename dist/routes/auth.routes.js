"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Create this file: src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller"); // Import login
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login); // Login will be added in a subsequent step
exports.default = router;
