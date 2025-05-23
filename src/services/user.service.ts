// Create this file: src/services/user.service.ts
import { usersDb } from '../database';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../config';

export class UserService {
    // Promisify NeDB operations
    private findOneAsync(query: any): Promise<User | null> {
        return new Promise((resolve, reject) => {
            usersDb.findOne(query, (err: Error | null, doc: User | null) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });
    }

    private insertAsync(doc: Partial<User>): Promise<User> {
        return new Promise((resolve, reject) => {
            usersDb.insert(doc, (err: Error | null, newDoc: User) => {
                if (err) reject(err);
                else resolve(newDoc);
            });
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.findOneAsync({ username });
    }

    async registerUser(userData: Pick<User, 'username' | 'passwordHash' | 'role'>): Promise<User> {
        const existingUser = await this.findByUsername(userData.username);
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Note: Hashing should be done in the controller/route handler before calling this service method
        // Or the service method should take raw password and hash it.
        // For now, assuming passwordHash is passed in.
        const newUser = await this.insertAsync({ ...userData, createdAt: new Date() });
        return newUser;
    }
}
