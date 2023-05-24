import mongoose from 'mongoose';
import { connectDB, dropDB, dropCollections } from '@brewica/util-testing';
import 'jest';
import { Roaster } from '../Roaster';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB();
});

describe('Roaster Model / Schema', () => {
    
    it('should successfully save a new roaster record', async () => {
        // arrange
        const mockUserId = new mongoose.Types.ObjectId();
        const validRoaster = new Roaster({
            user: mockUserId,
            name: 'Origin Coffee',
        });
        // act
        const savedRoaster = await validRoaster.save();
        // assert
        expect(savedRoaster).toBeDefined();
    });

    it('should successfully save a new user but ignore any fields that are not in the model/schema', async () => {
        // arrange        
        const mockUserId = new mongoose.Types.ObjectId();
        const validRoaster = new Roaster({
            user: mockUserId,
            name: 'Origin Coffee',
            woodfired: false // this field does not exist on the schema
        });
        // act
        const savedRoaster = await validRoaster.save();
        // assert
        expect(savedRoaster).toBeDefined();
        expect(savedRoaster).toEqual(expect.not.objectContaining({woodfired: expect.any(String)}));
    });
    it('should fail when attempting to save a user without all of the required fields', async () => {
        // arrange        
        const mockUserId = new mongoose.Types.ObjectId();
        const invalidRoaster = new Roaster({
            user: mockUserId,
        });
        // act
        let error: mongoose.Error.ValidationError;
        try {
            await invalidRoaster.save();
        } catch (err) {
            console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
    it('should fail when attempting to save a user with an invalid field data type', async () => {
        // arrange
        const invalidRoaster = new Roaster({
            user: 123,
            name: 'Origin Coffee'
        });
        // act
        let error: mongoose.Error.ValidationError;
        try {
            await invalidRoaster.save();
        } catch (err) {
            console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});