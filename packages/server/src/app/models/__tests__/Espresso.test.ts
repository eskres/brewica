import mongoose from 'mongoose';
import { connectDB, dropDB, dropCollections } from '@brewica/util-testing';
import 'jest';
import Espresso from '../Espresso';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB();
});

describe('Espresso Model / Schema', () => {
    
    it('should successfully save a new espresso document', async () => {
        // arrange
        const validEspresso = new Espresso({
            user: 'temp',
            coffee: 'temp',
            dose: 18,
            time: 28,
            temperature: 95,
            brewWeight: 36,
            taste: {
                bitter: true,
                dry: true,
                watery: true,
                fruity: true,
                sweet: true,
                floral: true,
                nutty: true,
                chocolatey: true,
                intense: true,
                salty: true,
                sour:true,
            }
        });
        // act
        const savedEspresso = await validEspresso.save();
        // assert
        expect(savedEspresso._id).toBeDefined();
        expect(savedEspresso.user).toBe(validEspresso.user);
        expect(savedEspresso.coffee).toBe(validEspresso.coffee);
        expect(savedEspresso.dose).toBe(validEspresso.dose);
        expect(savedEspresso.time).toBe(validEspresso.time);
        expect(savedEspresso.temperature).toBe(validEspresso.temperature);
        expect(savedEspresso.brewWeight).toBe(validEspresso.brewWeight);
        expect(savedEspresso.taste.bitter).toBe(validEspresso.taste.bitter);
        expect(savedEspresso.taste.dry).toBe(validEspresso.taste.dry);
        expect(savedEspresso.taste.watery).toBe(validEspresso.taste.watery);
        expect(savedEspresso.taste.fruity).toBe(validEspresso.taste.fruity);
        expect(savedEspresso.taste.sweet).toBe(validEspresso.taste.sweet);
        expect(savedEspresso.taste.floral).toBe(validEspresso.taste.floral);
        expect(savedEspresso.taste.nutty).toBe(validEspresso.taste.nutty);
        expect(savedEspresso.taste.chocolatey).toBe(validEspresso.taste.chocolatey);
        expect(savedEspresso.taste.intense).toBe(validEspresso.taste.intense);
        expect(savedEspresso.taste.salty).toBe(validEspresso.taste.salty);
        expect(savedEspresso.taste.sour).toBe(validEspresso.taste.sour);

    });

    it('should successfully save a new espresso document but ignore any fields that are not in the model/schema', async () => {
        const invalidEspresso = new Espresso({
            user: 'temp',
            coffee: 'temp',
            dose: 18,
            time: 28,
            temperature: 95,
            brewWeight: 36,
            taste: {
                bitter: true,
                dry: true,
                watery: true,
                fruity: true,
                sweet: true,
                floral: true,
                nutty: true,
                chocolatey: true,
                intense: true,
                salty: true,
                sour:true,
            },
            godShot: false
        });
        // act
        const savedEspresso = await invalidEspresso.save();
        
        // assert
        expect(savedEspresso._id).toBeDefined();
        expect(savedEspresso).toEqual(expect.not.objectContaining({godShot: expect.any(Boolean)}));
    });

    it('should fail when attempting to save an espresso document without all of the required fields', async () => {
        // User and coffee fields missing
        const invalidEspresso = new Espresso({
            dose: 18,
            time: 28,
            temperature: 95,
            brewWeight: 36,
            taste: {
                bitter: true,
                dry: true,
                watery: true,
                fruity: true,
                sweet: true,
                floral: true,
                nutty: true,
                chocolatey: true,
                intense: true,
                salty: true,
                sour:true,
            },
            godShot: false
        });
        // act
        let error: mongoose.Error.ValidationError;
        
        try {
            await invalidEspresso.save();     
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
    it('should fail when attempting to save an espresso document with an invalid field', async () => {
        // User and coffee fields missing
        const invalidEspresso = new Espresso({
            user: 'temp',
            coffee: 'temp',
            dose: 18,
            time: 28,
            temperature: 95,
            brewWeight: 36,
            taste: {
                bitter: true,
                dry: true,
                watery: true,
                fruity: true,
                sweet: true,
                floral: true,
                nutty: true,
                chocolatey: true,
                intense: true,
                salty: true,
                sour:true,
            }
        });
        // act
        let error: mongoose.Error.ValidationError;
        
        try {
            await invalidEspresso.save();     
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});