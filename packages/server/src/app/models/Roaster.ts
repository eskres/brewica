import mongoose from 'mongoose';
import { coffeeCountries, coffeeVarieties, coffeeProcesses, type ICoffee, type IRoaster } from '../../../../types'

const roasterSchema = new mongoose.Schema<IRoaster>({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    name: { type: String, required: true, lowercase: true, unique: true },
    coffee: [new mongoose.Schema<ICoffee>({
        name: {type: String, required: true},
        country: {
            type: String,
            enum: Object.values(coffeeCountries),
            required: true
        },
        region: {type: String, required: false},
        producer: {type: String, required: false},
        varieties: [{
            type: String,
            enum: Object.values(coffeeVarieties),
            required: false
        }],
        process: {
            type: String,
            enum: Object.values(coffeeProcesses),
            required: false},
        elevationMin: {type: Number, min: 500, max: 2500, required: false},
        elevationMax: {type: Number, min: 500, max: 2500, required: false},
        decaf: {type: Boolean, default: false, required: true},
    })]
});

export const Roaster = mongoose.model<IRoaster>('Roaster', roasterSchema);