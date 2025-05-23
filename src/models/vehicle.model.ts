export interface Vehicle {
    _id?: string; // NeDB auto-generated ID
    make: string;
    model: string;
    year: number;
    current_mileage: number;
    owner_id: string; // Foreign key linking to User._id
    createdAt?: Date;
}
