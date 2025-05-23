export interface FuelTopUp {
    _id?: string; // NeDB auto-generated ID
    vehicle_id: string; // Foreign key linking to Vehicle._id
    date: Date;
    mileage: number;
    fuel_amount_liters: number;
    fuel_price_per_liter: number;
    total_cost: number; // Calculated or entered
    createdAt?: Date;
}
