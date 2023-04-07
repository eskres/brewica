import 'jest';
import { connectDB, dropDB, dropCollections } from '../../../testUtils/mongoMemoryServer';
import supertest from 'supertest';
import { app } from '../../../main';
import { faker } from '@faker-js/faker';
import User from '../../models/User';
import type { IUser, ISignIn } from '../../../../../types';
import * as jose from 'jose';
import * as setCookie from 'set-cookie-parser'
import * as jwks from '../../../../jwks'
import { redisClient } from '../../../utils/redis';

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB;
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
        await supertest(app)
        .post("/auth/signup")
        .send(newUser)
        .expect(200);
        // Get user we just created from DB
        return savedUser = await User.findOne({emailAddress: newUser.emailAddress});
    });
    
    afterAll(async () => {
        if (redisClient.isOpen) {
            await redisClient.quit();
        }
    });

    test('successfully get new access and refresh tokens', async () => {
        // Arrange
        // Credentials for sign in
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: password,
        });
        // Get public keys to verify JWTs
        const accessSecret = await jose.importJWK(jwks.ACCESS_TOKEN_PUBLIC, 'EdDSA');
        const refreshSecret = await jose.importJWK(jwks.REFRESH_TOKEN_PUBLIC, 'EdDSA');

        // Act
        // Sign user in
        const signInResponse: supertest.Response = await supertest(app)
        .post("/auth/signin")
        .send(testUser)
        .expect(200);
        
        // Parse cookies from sign in response
        const signInCookie = setCookie.parse(signInResponse);
        
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
        .get("/auth/token")
        .set('Cookie', signInResponse.headers['set-cookie'])
        .send()
        .expect(200);

        // Parse cookie from refresh response
        const refreshCookie = setCookie.parse(refreshResponse);        

        // Verify original JWTs
        const accessToken = await jose.jwtVerify(signInResponse.body.accessToken, accessSecret);
        const refreshToken = await jose.jwtVerify(signInCookie[0].value, refreshSecret);

        // Verify new JWTs
        const newAccessToken = await jose.jwtVerify(refreshResponse.body.accessToken, accessSecret);
        const newRefreshToken = await jose.jwtVerify(refreshCookie[0].value, refreshSecret);

        // Check redis connection
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        // Assert
        expect(newAccessToken).toBeDefined;
        expect(newRefreshToken).toBeDefined;
        expect(newAccessToken.payload.jti).not.toEqual(accessToken.payload.jti);
        expect(newAccessToken.payload.fingerprint).not.toEqual(accessToken.payload.fingerprint);
        expect(newRefreshToken.payload.jti).not.toEqual(refreshToken.payload.jti);
        expect(newRefreshToken.payload.fingerprint).not.toEqual(refreshToken.payload.fingerprint);
        expect(newAccessToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
        expect(newRefreshToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
        expect(newRefreshToken.payload.exp).toEqual(refreshToken.payload.exp);        
        expect(refreshCookie[0].maxAge * 1000).toBeLessThanOrEqual((refreshToken.payload.exp * 1000) - Date.now());
        expect(await redisClient.get(signInCookie[0].value)).toEqual(savedUser._id.toString());
        expect(await redisClient.ttl(signInCookie[0].value)).toBeLessThanOrEqual(3600);
    });
    
    test('request should fail due to invalid token', async () => {
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
        
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
        .get("/auth/token")
        .set('Cookie', [`__Secure-refreshToken=${signInResponse.body.accessToken}`, signInResponse.header['set-cookie'][1]])
        .send()
        .expect(401);
        
        // Assert
        expect(refreshResponse.header['set-cookie']).not.toBeDefined;
        expect(refreshResponse.body.accessToken).not.toBeDefined;
    });

    test('request should fail due to missing fingerprint', async () => {
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
        
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
        .get("/auth/token")
        .set('Cookie', `__Secure-refreshToken=${signInResponse.header['set-cookie'][0]}`)
        .send()
        .expect(401);

        // Assert
        expect(refreshResponse.header['set-cookie']).not.toBeDefined;
        expect(refreshResponse.body.accessToken).not.toBeDefined;        
    });

    test('request should fail due to missing token', async () => {
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

        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
        .get("/auth/token")
        .set('Cookie', signInResponse.header['set-cookie'][1])
        .send()
        .expect(401);

        // Assert
        expect(refreshResponse.header['set-cookie']).not.toBeDefined;
        expect(refreshResponse.body.accessToken).not.toBeDefined;
    });
});