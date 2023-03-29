import 'jest';
import { connectDB, dropDB, dropCollections } from '../../../testUtils/mongoMemoryServer';
import supertest from 'supertest';
import { app } from '../../../main';
import { faker } from '@faker-js/faker';
import User from '../../models/User';
import type { IUser, ISignIn } from '../../../../../types';
import { transport } from '../../../utils/nodemailerTransport';
import * as jose from 'jose';
import * as setCookie from 'set-cookie-parser'
import { ACCESS_TOKEN_PUBLIC, REFRESH_TOKEN_PUBLIC } from '../../../../jwks'


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
        const response: supertest.Response = await supertest(app).post("/auth/signup").send(testUser);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
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
        const response: supertest.Response = await supertest(app).post("/auth/signup").send(testUser);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Email address');
        expect(response.body.message).toContain('is already registered');
        expect(response.status).toEqual(409);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup").send(testUser);
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Usernames must be no longer than 28 characters');
        expect(response.status).toEqual(400);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup").send(testUser)
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain('Only letters, numbers, dashes and underscores are permitted');
        expect(response.body.message).toContain('are not case sensitive');
        expect(response.status).toEqual(400);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup")
        .send(testUser)
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});

        // Assert
        expect(savedUser).not.toBeDefined;
        expect(response.body.message).toContain("Email address invalid, provider");
        expect(response.status).toEqual(400);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup")
        .send(testUser);        

        // Assert
        expect(sendMail).toBeCalledTimes(1);
        expect(sendMail.mock.calls[0][0].to).toEqual(testUser.emailAddress);
        expect(response.body.message).toEqual("Account created successfully");
        expect(response.status).toEqual(200);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup").send(testUser);
        
        // Assert
        expect(response.body.message).toContain("Passwords do not match");
        expect(response.status).toEqual(400);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup").send(testUser);
        
        // Assert
        expect(response.body.message).toContain("Password requires 8 or more characters");
        expect(response.status).toEqual(400);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup").send(testUser);
        
        // Assert
        expect(response.body.message).toContain("Password requires 8 or more characters");
        expect(response.status).toEqual(400);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup")
        .send(testUser);
        
        // Get stored password from the db
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});
        
        // Assert
        // // Check password stored in db does not match password variable
        expect(response.status).toEqual(200);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup")
        .send(testUser)
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});        

        // Assert
        expect(savedUser).toBeDefined;
        expect(savedUser.expiresAt).toBeDefined;
        expect(savedUser.expiresAt.getTime() - new Date().getTime()).toBeGreaterThan(23.99 * 60 * 60 * 1000);
        expect(savedUser.expiresAt.getTime() - new Date().getTime()).toBeLessThan(24 * 60 * 60 * 1000);
        expect(response.body.message).toEqual("Account created successfully");
        expect(response.status).toEqual(200);
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
        const response: supertest.Response = await supertest(app).post("/auth/signup")
        .send(testUser)
        const savedUser: IUser = await User.findOne({emailAddress: testUser.emailAddress});        
        
        // Assert
        expect(savedUser).toBeDefined;
        expect(savedUser.emailAddress).toEqual(testUser.emailAddress.toLocaleLowerCase());
        expect(response.body.message).toEqual("Account created successfully");
        expect(response.status).toEqual(200);
    });

});

describe('User POST /auth/signin', () => {

    let savedUser: IUser;
    const password: string = faker.internet.password(15, false, /\w/, '_0');

    const newUser: IUser = ({
        username: faker.internet.userName(),
        emailAddress: faker.internet.email(),
        password: password,
        passwordConf: password
    });

    beforeAll(async () => {
        await supertest(app).post("/auth/signup").send(newUser);
        return savedUser = await User.findOne({emailAddress: newUser.emailAddress});
    });

    test('catch an incorrect password and send error message to user', async () => {
        
        // Arrange
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: 'password',
        });

        // Act
        const response = await supertest(app).post("/auth/signin")
        .send(testUser)

        // Assert
        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual("Password incorrect");

    });

    test('catch a non existant account and send error message to user', async () => {
        // Arrange
        const testUser: ISignIn = ({
            emailAddress: 'test@test.com',
            password: password,
        });

        // Act
        const response = await supertest(app).post("/auth/signin")
        .send(testUser)

        // Assert
        expect(response.status).toEqual(400);
        expect(response.body.message).toEqual("Account not found");

    });

    test('a successful sign in should respond with JWT access token and refresh token', async () => {
        // Arrange
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: password,
        });

        const accessSecret = await jose.importJWK(ACCESS_TOKEN_PUBLIC, 'EdDSA');
        const refreshSecret = await jose.importJWK(REFRESH_TOKEN_PUBLIC, 'EdDSA');

        // Act
        const response: supertest.Response = await supertest(app).post("/auth/signin").send(testUser);
        const cookie = setCookie.parse(response);
        
        const accessToken = await jose.jwtVerify(response.body.accessToken, accessSecret);
        const refreshToken = await jose.jwtVerify(cookie[0].value, refreshSecret);
        
        // Assert
        expect(response.status).toEqual(200);
        expect(cookie[0].name).toEqual('__Secure-refreshToken');
        expect(cookie[1].name).toEqual('__Secure-fingerprint');
        expect(accessToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
        expect(refreshToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
    });
});

describe('User GET /auth/token', () => {
    // Declare user variable
    let savedUser: IUser;

    // Generate a password
    const password: string = faker.internet.password(15, false, /\w/, '_0');

    // Claims for user sign up
    const newUser: IUser = ({
        username: faker.internet.userName(),
        emailAddress: faker.internet.email(),
        password: password,
        passwordConf: password
    });
    
    
    beforeAll(async () => {
        // Send request to sign up user
        await supertest(app).post("/auth/signup").send(newUser);
        // Get user we just created from DB
        return savedUser = await User.findOne({emailAddress: newUser.emailAddress});
    });
    
    test('successfully get new access and refresh tokens', async () => {
        
        // Arrange
        // Credentials for sign in
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: password,
        });

        // Get public keys to verify JWTs
        const accessSecret = await jose.importJWK(ACCESS_TOKEN_PUBLIC, 'EdDSA');
        const refreshSecret = await jose.importJWK(REFRESH_TOKEN_PUBLIC, 'EdDSA');

        // Act
        // Sign user in
        const signInResponse: supertest.Response = await supertest(app).post("/auth/signin").send(testUser);
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app).post("/auth/refresh").send(signInResponse.body.accessToken);

        // Parse cookies from responses
        const signInCookie = setCookie.parse(signInResponse);
        const refreshCookie = setCookie.parse(refreshResponse);

        // Verify original JWTs
        const accessToken = await jose.jwtVerify(signInResponse.body.accessToken, accessSecret);
        const refreshToken = await jose.jwtVerify(signInCookie[0].value, refreshSecret);

        // Verify new JWTs
        const newAccessToken = await jose.jwtVerify(refreshResponse.body.accessToken, accessSecret);
        const newRefreshToken = await jose.jwtVerify(refreshCookie[0].value, refreshSecret);

        // Assert
        expect(signInResponse.status).toEqual(200);
        expect(refreshResponse.status).toEqual(200);
        expect(newAccessToken).toBeDefined;
        expect(newRefreshToken).toBeDefined;
        expect(newAccessToken).not.toEqual(accessToken);
        expect(newRefreshToken).not.toEqual(refreshToken);
        expect(newAccessToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
        expect(newRefreshToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
    });
});