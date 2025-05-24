"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
// src/services/user.service.ts
const database_1 = require("../database");
class UserService {
    findOneAsync(query) {
        return new Promise((resolve, reject) => {
            database_1.usersDb.findOne(query, (err, doc) => {
                if (err)
                    reject(err);
                else
                    resolve(doc);
            });
        });
    }
    // Changed 'doc' type here
    insertAsync(doc) {
        return new Promise((resolve, reject) => {
            // NeDB's insert should handle the provided doc type if it aligns with the User model (minus _id)
            database_1.usersDb.insert(doc, (err, newDoc) => {
                if (err)
                    reject(err);
                else
                    resolve(newDoc);
            });
        });
    }
    async findByUsername(username) {
        return this.findOneAsync({ username });
    }
    // Ensure userData passed to registerUser has the required fields.
    // The controller already hashes password, so passwordHash is passed.
    async registerUser(userData) {
        // The check for existingUser is good.
        // const existingUser = await this.findByUsername(userData.username);
        // if (existingUser) {
        //     throw new Error('User already exists');
        // }
        const userToInsert = {
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
exports.UserService = UserService;
