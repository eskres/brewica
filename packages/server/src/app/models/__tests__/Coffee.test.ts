import mongoose from 'mongoose';
import { connectDB, dropDB, dropCollections } from '@brewica/util-testing';
import 'jest';
import { Roaster } from '../Roaster';
import { type ICoffee } from '../../../../../types'

beforeAll(async () => {
    await connectDB();
});
beforeEach(async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const validRoaster = new Roaster({
        user: mockUserId,
            name: 'Acme Coffee',
    });
    await validRoaster.save();
})
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB();
});

describe('Coffee Model / Schema', () => {
    
    it('should successfully save a new coffee document', async () => {
        // arrange
        const validCoffee: ICoffee = {
            name: 'New Beans',
            country: 'Brazil',
            region: 'temp',
            producer: 'temp',
            varieties: ['SL28'],
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false
        }
        const roaster= await Roaster.findOne({name: 'Acme Coffee'});
        // act
        if (roaster) { roaster.coffee.push(validCoffee); }
        await roaster.save();
        const savedCoffee = roaster.coffee[0];
        // assert
        expect(savedCoffee._id).toBeDefined();
        expect(savedCoffee.country).toEqual(validCoffee.country);
        expect(savedCoffee.region).toEqual(validCoffee.region);
        expect(savedCoffee.varieties).toEqual(validCoffee.varieties);
        expect(savedCoffee.producer).toEqual(validCoffee.producer);
        expect(savedCoffee.process).toEqual(validCoffee.process);
        expect(savedCoffee.elevationMin).toEqual(validCoffee.elevationMin);
        expect(savedCoffee.elevationMax).toEqual(validCoffee.elevationMax);
        expect(savedCoffee.decaf).toEqual(validCoffee.decaf);
    });
    it('should successfully save a new coffee document but ignore any fields that are not in the model/schema', async () => {
        // arrange
        const invalidCoffee: any = {
            name: 'New Beans',
            country: 'Brazil',
            region: 'temp',
            producer: 'temp',
            varieties: ['SL28'],
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false,
            // tea is an invalid field that does not exist on the schema
            tea: false
        }
        const roaster= await Roaster.findOne({name: 'Acme Coffee'});
        // act
        if (roaster) { roaster.coffee.push(invalidCoffee); }
        await roaster.save();
        const savedCoffee = roaster.coffee[0];
        // assert
        expect(savedCoffee).toBeDefined();
        expect(savedCoffee).toEqual(expect.not.objectContaining({tea: expect.any(String)}));
    });
    it('should fail when attempting to save a coffee document without all of the required fields', async () => {
        // arrange
        // using any to avoid typescript error in order to test schema validation
        const invalidCoffee: any = {
            // name field is missing
            country: 'Brazil',
            region: 'temp',
            producer: 'temp',
            varieties: ['SL28'],
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false
        };
        let error: mongoose.Error.ValidationError;
        // act
        try {
            const roaster= await Roaster.findOne({name: 'Acme Coffee'});
            if (roaster) { roaster.coffee.push(invalidCoffee); }
            await roaster.save();
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
    it('should fail when attempting to save a coffee document with an invalid field data type', async () => {
        // arrange
        // using any to avoid typescript error in order to test schema validation
        const invalidCoffee: any = {
            name: [],
            country: 'Brazil',
            region: 'temp',
            producer: 'temp',
            varieties: ['SL28'],
            process: 'Washed',
            elevationMin: 1850,
            elevationMax: 2000,
            decaf: false
        };
        let error: mongoose.Error.ValidationError;
        // act
        try {
            const roaster= await Roaster.findOne({name: 'Acme Coffee'});
            if (roaster) { roaster.coffee.push(invalidCoffee); }
            await roaster.save();
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});