import { describe, test, beforeAll, afterAll, beforeEach, afterEach, expect, vi, SpyInstance } from 'vitest'
import { connectDB, dropDB, dropCollections } from '../../../testUtils/mongoMemoryServer'
import request = require('supertest')
import { app } from '../../../main'
import { faker } from '@faker-js/faker';
import { User } from '../../models/User'
import UserModel from '../../models/User';
import { transport } from '../../../utils/nodemailer';

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
        const password: string = faker.internet.password(15, false, /\w/, '_0');
        const username: string = faker.internet.userName();
        
        const existingUser = new UserModel({
            username: username,
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password,
            token: faker.datatype.uuid()
        });
        
        const testUser: User = ({
            username: username,
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password
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
        const password: string = faker.internet.password(15, false, /\w/, '_0');
        const emailAddress: string = faker.internet.email().toLowerCase();
        
        const existingUser = new UserModel({
            username: faker.internet.userName(),
            emailAddress: emailAddress,
            password: password,
            passwordConf: password,
            token: faker.datatype.uuid()
        });
        
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: emailAddress,
            password: password,
            passwordConf: password
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
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: User = ({
            // uuid is too long to be a valid username
            username: faker.datatype.uuid(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password
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
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: User = ({
            username: '$%^',
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password
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
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: '$%^@123',
            password: password,
            passwordConf: password
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
    
    test('send verification email once and receive no errors', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');
        
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });
        
        // Act
        const sendMail: SpyInstance = vi.spyOn(transport, 'sendMail');
        const response: request.Response = await request(app).post("/auth/signup")
        .send(testUser);        

        // Assert
        expect(sendMail).toBeCalledTimes(1);
        expect(sendMail.mock.results[0].value.accepted[0]).toEqual(testUser.emailAddress);
        expect(response.body.message).toEqual("Account created successfully");
        expect(response.status).toEqual(200);
    });

    test('catch non matching passwords, do not save, send error message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup").send(testUser);
        
        // Assert
        expect(response.body.message).toContain("Passwords do not match");
        expect(response.status).toEqual(400);
    });

    test('catch an invalid password (regex length), do not save, send error message to user', async () => {
        // Arrange
        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: 123,
            passwordConf: 123
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
            password: 'üîøåéüîøåé',
            passwordConf: 'üîøåéüîøåé'
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup").send(testUser);
        
        // Assert
        expect(response.body.message).toContain("Password requires 8 or more characters");
        expect(response.status).toEqual(400);
    });


    test('hash password with argon2id and save to MongoDB', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });
        // Act
        const response: request.Response = await request(app).post("/auth/signup")
        .send(testUser);
        
        // Get stored password from the db
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        // // Check password stored in db does not match password variable
        expect(response.status).toEqual(200);
        expect(savedUser.emailAddress).toEqual(testUser.emailAddress.toLowerCase())
        expect(savedUser.password).not.toEqual(testUser.password)
        expect(savedUser.password).toContain('argon2id')
    });

    test('saves the user to MongoDB and sends a success message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: User = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });
        
        // Act
        const response: request.Response = await request(app).post("/auth/signup")
        .send(testUser)
        const savedUser: User = await UserModel.findOne({emailAddress: testUser.emailAddress});        

        // Assert
        expect(savedUser).toBeDefined;
        expect(savedUser.emailAddress).toEqual(testUser.emailAddress.toLocaleLowerCase());
        expect(response.body.message).toEqual("Account created successfully");
        expect(response.status).toEqual(200);
    });

})