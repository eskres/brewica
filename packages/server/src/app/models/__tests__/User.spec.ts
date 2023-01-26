import mongoose = require('mongoose');
import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import { connectDB, dropDB, dropCollections } from '../../../testUtils/mongoMemoryServer'
import UserModel from '../../models/User';
import { faker } from '@faker-js/faker';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB;
});

describe('User Model / Schema', () => {
    
    it('should successfully save a new user', async () => {
        // arrange
        const validUser = new UserModel({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: faker.internet.password()
        });
        // act
        const savedUser = await validUser.save();
        // assert
        expect(savedUser._id).toBeDefined();
        expect(savedUser.username).toBe(validUser.username);
        expect(savedUser.emailAddress).toBe(validUser.emailAddress);
        expect(savedUser.password).toBe(validUser.password);
    }); 

    it('should successfully save a new user but ignore any fields that are not in the model/schema', async () => {
        // arrange
        const userWithInvalidField = new UserModel({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: faker.internet.password(),
            name: faker.name.firstName()
        });
        // act
        const savedUserWithInvalidField = await userWithInvalidField.save();
        // assert
        expect(savedUserWithInvalidField._id).toBeDefined();
        expect(savedUserWithInvalidField.name).toBeUndefined();
    });

    it('should fail when attempting to save a user without all of the required fields', async () => {
        // arrange
        const userWithoutRequiredField = new UserModel({
            userName: faker.internet.userName(),
        });
        // act
        let error: mongoose.Error.ValidationError;
        try {
            await userWithoutRequiredField.save();     
        } catch (err) {
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.emailAddress).toBeDefined();
        expect(error.errors.password).toBeDefined();
    });
    it('should fail when attempting to save a user with an invalid field', async () => {
        // arrange
        const userWithoutRequiredField = new UserModel({
            username: 123,
            emailAddress: 123,
            password: 123
        });
        // act
        let error: mongoose.Error.ValidationError;
        
        try {
            await userWithoutRequiredField.save();     
        } catch (err) {
            // console.log(err);
            error = err;
        }
        // assert
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(error.errors.password).toBeDefined();
        // expect(error.errors.username).toBeDefined();
        // expect(error.errors.emailAddress).toBeDefined();
    });
})