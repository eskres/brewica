import mongoose from 'mongoose';
import { type IEspresso } from '../../../../types';

const espressoSchema = new mongoose.Schema<IEspresso>({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    coffee: {type: mongoose.Schema.Types.ObjectId, ref: 'Coffee', required: true},
    dose: {type: Number, required: true},
    time: {type: Number, required: true},
    temperature: {type: Number, required: true},
    brewWeight: {type: Number, required: true},
    bitter: {type: Boolean, default: false, required: true},
    dry: {type: Boolean, default: false, required: true},
    watery: {type: Boolean, default: false, required: true},
    fruity: {type: Boolean, default: false, required: true},
    sweet: {type: Boolean, default: false, required: true},
    floral: {type: Boolean, default: false, required: true},
    nutty: {type: Boolean, default: false, required: true},
    chocolatey: {type: Boolean, default: false, required: true},
    intense: {type: Boolean, default: false, required: true},
    salty: {type: Boolean, default: false, required: true},
    sour: {type: Boolean, default: false, required: true}
});

export const Espresso = mongoose.model<IEspresso>('Espresso', espressoSchema);