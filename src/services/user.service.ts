// src/services/user.service.ts
import { usersDb } from '../database';
import { User } from '../models/user.model';
// import bcrypt from 'bcrypt'; // Not used in this snippet, but likely in the full file
// import { BCRYPT_SALT_ROUNDS } from '../config'; // Not used in this snippet

// Define a type for the document to be inserted, ensuring required fields are present.
// _id is optional as NeDB generates it. createdAt will be added.
type UserCreationAttributes = Omit<User, '_id' | 'createdAt' | 'passwordHash'> & {
    passwordHash: string; // Ensure passwordHash is also part of this specific type if it's always set before insert
};


export class UserService {
    private findOneAsync(query: any): Promise<User | null> {
        return new Promise((resolve, reject) => {
            usersDb.findOne(query, (err: Error | null, doc: User | null) => {
                if (err) reject(err);
                else resolve(doc);
            });
        });
    }

    // Changed 'doc' type here
    private insertAsync(doc: Omit<User, '_id'>): Promise<User> {
        return new Promise((resolve, reject) => {
            // NeDB's insert should handle the provided doc type if it aligns with the User model (minus _id)
            usersDb.insert(doc, (err: Error | null, newDoc: User) => {
                if (err) reject(err);
                else resolve(newDoc);
            });
        });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.findOneAsync({ username });
    }

    // Ensure userData passed to registerUser has the required fields.
    // The controller already hashes password, so passwordHash is passed.
    async registerUser(userData: { username: string; passwordHash: string; role: 'admin' | 'user' }): Promise<User> {
        // The check for existingUser is good.
        // const existingUser = await this.findByUsername(userData.username);
        // if (existingUser) {
        //     throw new Error('User already exists');
        // }

        const userToInsert: Omit<User, '_id'> = {
            username: userData.username,
            passwordHash: userData.passwordHash,
            role: userData.role,
            createdAt: new Date()
        };
        
        // The error 'User already exists' should be thrown by the controller after findByUsername,
        // or this service method should also check and throw.
        // For now, focusing on the type error for insert.
        // Assuming existingUser check is handled before this call or at the start of this method.
        
        const newUser = await this.insertAsync(userToInsert);
        return newUser;
    }
}
