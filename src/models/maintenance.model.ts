export interface MaintenanceRecord {
    _id?: string; // NeDB auto-generated ID
    vehicle_id: string; // Foreign key linking to Vehicle._id
    date: Date;
    mileage: number;
    repair_type: string; // This might become a more complex type later
    cost: number;
    location?: string; // Optional
    notes?: string; // Optional field for additional details
    createdAt?: Date;
}
