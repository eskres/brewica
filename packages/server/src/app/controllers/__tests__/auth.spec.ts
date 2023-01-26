import { describe, test, beforeAll, afterAll, afterEach, expect } from 'vitest'
import { connectDB, dropDB, dropCollections } from '../../../testUtils/mongoMemoryServer'
import request = require('supertest')
import { app } from '../../../main'
import { faker } from '@faker-js/faker';
import { User } from '../../models/User'
import UserModel from '../../models/User';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB;
});

describe('User POST /auth/signup', () => {


    test('catch pre-existing username, do not save, send error message to user', async () => {
        // Arrange
        const username: string = faker.internet.userName();
        
        const existingUser = new UserModel({
            username: username,
            emailAddress: faker.internet.email().toLowerCase(),
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        const testUser: User = ({
            username: username,
            emailAddress: faker.internet.email().toLowerCase(),
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act
        existingUser.save();
        const response: request.Response = await request(app).post("/auth/signup").send(testUser);
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.status).toEqual(409);
        expect(response.body.message).toContain('Username');
        expect(response.body.message).toContain('is already registered');
    });


    test('catch pre-existing email address, do not save, send error message to user', async () => {
        // Arrange
        const emailAddress: string = faker.internet.email().toLowerCase();
        
        const existingUser = new UserModel({
            username: faker.internet.userName(),
            emailAddress: emailAddress,
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: emailAddress,
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act
        existingUser.save();
        const response: request.Response = await request(app).post("/auth/signup").send(testUser);
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Email address');
        expect(response.body.message).toContain('is already registered');
        expect(response.status).toEqual(409);
    });
    

    test('catch an invalid username (regex length), do not save, send error message to user', async () => {
        // Arrange
        const testUser: User = ({
            // uuid is too long to be a valid username
            username: faker.datatype.uuid(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act        
        const response: request.Response = await request(app).post("/auth/signup").send(testUser);
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Usernames must be no longer than 28 characters');
        expect(response.status).toEqual(400);
    });

    
    test('catch an invalid username (regex characters), do not save, send error message to user', async () => {
        // Arrange
        const testUser: User = ({
            username: '$%^',
            emailAddress: faker.internet.email().toLowerCase(),
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup").send(testUser)
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Only letters, numbers, dashes and underscores are permitted');
        expect(response.body.message).toContain('are not case sensitive');
        expect(response.status).toEqual(400);
    });
    
    
    test('catch an invalid email address (dns mx), do not save, send error message to user', async () => {
        // Arrange
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: '$%^@123',
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup")
        .send(testUser)
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});

        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain("Email address invalid, provider");
        expect(response.status).toEqual(400);
    })
    

    test('catch an invalid password (regex length), do not save, send error message to user', async () => {
        // Arrange
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: 123
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup").send(testUser);
        
        // Assert
        expect(response.body.message).toContain("Password requires 8 or more characters");
        expect(response.status).toEqual(400);
    });

    test('catch an invalid password (regex characters), do not save, send error message to user', async () => {
        // Arrange
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: 'üîøåé'
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup").send(testUser);
        
        // Assert
        expect(response.body.message).toContain("Password requires 8 or more characters");
        expect(response.status).toEqual(400);
    });


    test('hash password and save to MongoDB', async () => {
        // Arrange        
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        // Act
        const response: request.Response = await request(app).post("/auth/signup")
        .send(testUser)        
        
        // Get stored password from the db
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        // // Check password stored in db does not match password variable
        expect(response.status).toEqual(200);
        expect(savedUser.emailAddress).toEqual(testUser.emailAddress.toLowerCase())
        expect(savedUser.password).not.toEqual(testUser.password)
    })

    test('saves the user to MongoDB and sends a success message to user', async () => {
        // Arrange
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup")
        .send(testUser)
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});

        // Assert
        expect(savedUser).not.toBeDefined;
        expect(savedUser.emailAddress).toEqual(testUser.emailAddress.toLocaleLowerCase());
        expect(response.body.message).toEqual("Account created successfully");
        expect(response.status).toEqual(200);
    })
})