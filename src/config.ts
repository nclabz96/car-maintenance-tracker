// Create this file: src/config.ts
export const JWT_SECRET = process.env.JWT_SECRET || 'your-very-secure-secret-key'; // For production, use environment variables
export const BCRYPT_SALT_ROUNDS = 10;
