"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BCRYPT_SALT_ROUNDS = exports.JWT_SECRET = void 0;
// Create this file: src/config.ts
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret-key'; // For production, use environment variables
exports.BCRYPT_SALT_ROUNDS = 10;
