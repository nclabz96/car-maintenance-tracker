export interface User {
    _id?: string; // NeDB auto-generated ID
    username: string;
    passwordHash: string; // Store hashed passwords, not plain text
    role: 'admin' | 'user';
    createdAt?: Date;
}
