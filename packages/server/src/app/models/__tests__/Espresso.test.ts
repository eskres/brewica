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
    
    it('should successfully save a new espresso record', async () => {
        // arrange
        const validEspresso = new Espresso({
            user: 'temp',
            coffee: 'temp',
            dose: 18,
            time: 28,
            temperature: 95,
            espressoWeight: 36,
            taste: {
                bitter: true,
                dry: true,
                watery: true,
                fruity: true,
                sweet: true,
                floral: true,
                nutty: true,
                chocolatey: true,
                strong: true,
                salty: true,
                sour:true,
            }
        });
        // act
        const savedEspresso = await validEspresso.save();
        // assert
        expect(savedEspresso.user).toBeDefined();
        expect(savedEspresso.coffee).toBeDefined();
        expect(savedEspresso.dose).toBeDefined();
        expect(savedEspresso.time).toBeDefined();
        expect(savedEspresso.temperature).toBeDefined();
        expect(savedEspresso.espressoWeight).toBeDefined();
        expect(savedEspresso.taste.bitter).toBeDefined();
        expect(savedEspresso.taste.dry).toBeDefined();
        expect(savedEspresso.taste.watery).toBeDefined();
        expect(savedEspresso.taste.fruity).toBeDefined();
        expect(savedEspresso.taste.sweet).toBeDefined();
        expect(savedEspresso.taste.strong).toBeDefined();
        expect(savedEspresso.taste.salty).toBeDefined();
        expect(savedEspresso.taste.sour).toBeDefined();
    });

    it('should successfully save a new user but ignore any fields that are not in the model/schema', async () => {
        const invalidEspresso = new Espresso({
            user: 'temp',
            coffee: 'temp',
            dose: 18,
            time: 28,
            temperature: 95,
            espressoWeight: 36,
            taste: {
                bitter: true,
                dry: true,
                watery: true,
                fruity: true,
                sweet: true,
                strong: true,
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
});