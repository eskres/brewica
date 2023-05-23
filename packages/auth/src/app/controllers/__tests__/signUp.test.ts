import 'jest';
import { connectDB, dropDB, dropCollections } from '@brewica/util-testing';
import supertest from 'supertest';
import { app } from '../../../main';
import { faker } from '@faker-js/faker';
import User from '../../models/User';
import type { IUser } from '../../../../../types';
import { transport } from '../../../utils/nodemailerTransport';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB();
});

describe('User POST /auth/signup', () => {

    test('catch pre-existing username, do not save, send error message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');
        const username: string = faker.internet.userName();
        
        const existingUser = new User({
            username: username,
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password,
            token: faker.datatype.uuid()
        });
        
        const testUser: IUser = ({
            username: username,
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password
        });
        
        // Act
        existingUser.save();
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(409);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Username');
        expect(response.body.message).toContain('is already registered');
    });


    test('catch pre-existing email address, do not save, send error message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');
        const emailAddress: string = faker.internet.email().toLowerCase();
        
        const existingUser = new User({
            username: faker.internet.userName(),
            emailAddress: emailAddress,
            password: password,
            passwordConf: password,
            token: faker.datatype.uuid()
        });
        
        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: emailAddress,
            password: password,
            passwordConf: password
        });
        
        // Act
        existingUser.save();
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(409);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Email address');
        expect(response.body.message).toContain('is already registered');
    });
    

    test('catch an invalid username (regex length), do not save, send error message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: IUser = ({
            // uuid is too long to be a valid username
            username: faker.datatype.uuid(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password
        });
        
        // Act        
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(400);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Usernames must be no longer than 28 characters');
    });

    
    test('catch an invalid username (regex characters), do not save, send error message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: IUser = ({
            username: '$%^',
            emailAddress: faker.internet.email().toLowerCase(),
            password: password,
            passwordConf: password
        });
        
        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(400);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Only letters, numbers, dashes and underscores are permitted');
        expect(response.body.message).toContain('are not case sensitive');
    });
    
    
    test('catch an invalid email address (dns mx), do not save, send error message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: '$%^@123',
            password: password,
            passwordConf: password
        });
        
        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(400);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});

        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain("Email address invalid, provider");
    })
    
    test('send verification email once and receive no errors', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');
        
        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });
        
        // Act
        const sendMail: jest.SpyInstance = jest.spyOn(await transport, 'sendMail');
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(200);        

        // Assert
        expect(sendMail).toBeCalledTimes(1);
        expect(sendMail.mock.calls[0][0].to).toEqual(testUser.emailAddress);
        expect(response.body.message).toEqual("Account created successfully");
    });

    test('catch non matching passwords, do not save, send error message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: faker.internet.password(15, false, /\w/, '_0')
        });
        
        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(400);
        
        // Assert
        expect(response.body.message).toContain("Passwords do not match");
    });

    test('catch an invalid password (regex length), do not save, send error message to user', async () => {
        // Arrange
        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: '123',
            passwordConf: '123'
        });
        
        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(400);
        
        // Assert
        expect(response.body.message).toContain("Password requires 8 or more characters");
    });

    test('catch an invalid password (regex characters), do not save, send error message to user', async () => {
        // Arrange
        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email().toLowerCase(),
            password: 'üîøåéüîøåé',
            passwordConf: 'üîøåéüîøåé'
        });
        
        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(400);
        
        // Assert
        expect(response.body.message).toContain("Password requires 8 or more characters");
    });


    test('hash password with argon2id and save to MongoDB', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });
        // Act
        await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(200);
        
        // Get stored password from the db
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        // // Check password stored in db does not match password variable
        expect(savedUser.emailAddress).toEqual(testUser.emailAddress.toLowerCase())
        expect(savedUser.password).not.toEqual(testUser.password)
        expect(savedUser.password).toContain('argon2id')
    });

    test('saves the user to MongoDB and generates and expiresAt time in the future', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });
        
        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(200);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});        

        // Assert
        expect(savedUser).toBeDefined;
        expect(savedUser.expiresAt).toBeDefined;
        expect(savedUser.expiresAt.getTime() - new Date().getTime()).toBeGreaterThan(23.99 * 60 * 60 * 1000);
        expect(savedUser.expiresAt.getTime() - new Date().getTime()).toBeLessThan(24 * 60 * 60 * 1000);
        expect(response.body.message).toEqual("Account created successfully");
    });

    test('saves the user to MongoDB and sends a success message to user', async () => {
        // Arrange
        const password: string = faker.internet.password(15, false, /\w/, '_0');

        const testUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });
        
        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signup")
        .send(testUser)
        .expect(200);

        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});        
        
        // Assert
        expect(savedUser).toBeDefined;
        expect(savedUser.emailAddress).toEqual(testUser.emailAddress.toLocaleLowerCase());
        expect(response.body.message).toEqual("Account created successfully");
    });
});