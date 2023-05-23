import 'jest';
import { connectDB, dropDB, dropCollections } from '@brewica/util-testing';
import supertest from 'supertest';
import { app } from '../../../main';
import { faker } from '@faker-js/faker';
import User from '../../models/User';
import type { IUser, ISignIn } from '../../../../../types';
import * as setCookie from 'set-cookie-parser'
import { redisClient } from '../../../utils/redis';
import { createHash } from 'crypto';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
    await dropDB();
});

describe('User GET /auth/signout', () => {
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
        await supertest(app)
        .post("/auth/signup")
        .send(newUser)
        .expect(200);
        // Get user we just created from DB
        return savedUser = await User.findOne({emailAddress: newUser.emailAddress});
    });
    
    test('successfully sign out and clear refresh token cookie', async () => {
        // Arrange
        // Credentials for sign in
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: password,
        });

        // Act
        // Sign user in
        const signInResponse: supertest.Response = await supertest(app)
        .post("/auth/signin")
        .send(testUser)
        .expect(200);
        
        // Parse cookies from sign in response
        const signInCookie = setCookie.parse(signInResponse);
        
        // Request refresh token
        const signOutResponse: supertest.Response = await supertest(app)
        .get("/auth/signout")
        .auth(signInResponse.body.access_token, {type: 'bearer'})
        .set('Cookie', signInResponse.headers['set-cookie'])
        .send()
        .expect(205);

        const refreshTokenHash: string = createHash('sha256').update(signInCookie[0].value as string).digest('hex');

        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        // Assert
        expect(await redisClient.exists(refreshTokenHash)).toEqual(1);
        expect(signOutResponse.header['set-cookie']).not.toBeDefined;
    });
});