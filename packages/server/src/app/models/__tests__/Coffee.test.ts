import mongoose from 'mongoose';
import { connectDB, dropDB, dropCollections } from '@brewica/util-testing';
import 'jest';
import Coffee from '../Coffee';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB();
});

describe('Coffee Model / Schema', () => {
    
    it('should successfully save a new coffee document', async () => {
        // arrange
        const validCoffee = new Coffee({
            roaster: 'temp',
            country: 'Kenya',
            region: 'temp',
            producer: 'temp',
            varieties: {SL28: true},
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false,
        });
        // act
        const savedCoffee = await validCoffee.save();
        // assert
        expect(savedCoffee._id).toBeDefined();
        expect(savedCoffee.roaster).toBe(validCoffee.roaster);
        expect(savedCoffee.county).toBe(validCoffee.country);
        expect(savedCoffee.region).toBe(validCoffee.region);
        expect(savedCoffee.varieties).toBe(validCoffee.producer);
        expect(savedCoffee.process).toBe(validCoffee.process);
        expect(savedCoffee.elevationMin).toBe(validCoffee.elevationMin);
        expect(savedCoffee.elevationMax).toBe(validCoffee.elevationMax);
        expect(savedCoffee.decaf).toBe(validCoffee.decaf);
    });
    it('should successfully save a new coffee document but ignore any fields that are not in the model/schema', async () => {
        // arrange
        const invalidCoffee = new Coffee({
            roaster: 'temp',
            country: 'Kenya',
            region: 'temp',
            producer: 'temp',
            varieties: {SL28: true},
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false,
            tea: false
        });
        // act
        let error: mongoose.Error.ValidationError;
        
        try {
            await invalidCoffee.save();     
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    it('should fail when attempting to save a coffee document without all of the required fields', async () => {
        // arrange
        const invalidCoffee = new Coffee({
            country: 'Kenya',
            region: 'temp',
            producer: 'temp',
            varieties: {SL28: true},
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false,
        });
        // act
        let error: mongoose.Error.ValidationError;
        
        try {
            await invalidCoffee.save();     
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
    it('should fail when attempting to save a coffee document with an invalid field', async () => {
        // arrange
        const invalidCoffee = new Coffee({
            roaster: 'temp',
            country: 'Kenya',
            region: 'temp',
            producer: 'temp',
            varieties: {SL28: true},
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false,
        });
        // act
        let error: mongoose.Error.ValidationError;
        
        try {
            await invalidCoffee.save();     
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});