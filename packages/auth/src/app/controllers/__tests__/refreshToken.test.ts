import 'jest';
import { connectDB, dropDB, dropCollections } from '@brewica/util-testing';
import supertest from 'supertest';
import { app } from '../../../main';
import { faker } from '@faker-js/faker';
import User from '../../models/User';
import type { IUser, ISignIn } from '../../../../../types';
import * as jose from 'jose';
import * as setCookie from 'set-cookie-parser'
import * as jwks from '../../../jwks'
import { redisClient } from '../../../utils/redis';
import { createHash } from 'crypto';
import { createToken } from '../../../utils/createToken';

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


describe('User GET /auth/token', () => {
    
    let savedUser: IUser;
    let signInResponse: supertest.Response;
    
    beforeAll(async () => {
        // Generate password
        const password: string = faker.internet.password(15, false, /\w/, '_0');
        // Claims for user sign up
        const newUser: IUser = ({
            username: faker.internet.userName(),
            emailAddress: faker.internet.email(),
            password: password,
            passwordConf: password
        });

        // Send request to sign up user
        await supertest(app)
            .post("/auth/signup")
            .send(newUser)
            .expect(200);
        // Get user we just created from DB
        savedUser = await User.findOne({emailAddress: newUser.emailAddress});
        
        // Credentials for sign in
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: password,
        });

        // Sign user in
        signInResponse = await supertest(app)
            .post("/auth/signin")
            .send(testUser)
            .expect(200);
    });

    test('successfully get new access and refresh tokens then blacklist old refresh token', async () => {        
        // Arrange

        // Get public keys to verify JWTs
        const accessSecret = await jose.importJWK(jwks.ACCESS_TOKEN_PUBLIC, 'EdDSA');
        const refreshSecret = await jose.importJWK(jwks.REFRESH_TOKEN_PUBLIC, 'EdDSA');

        // Act        
        // Parse cookies from sign in response
        const signInCookie = setCookie.parse(signInResponse);
        
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
            .get("/auth/token")
            .auth(signInResponse.body.access_token, {type: 'bearer'})
            .set('Cookie', signInResponse.headers['set-cookie'])
            .send()
            .expect(200);

        // Parse cookie from refresh response
        const refreshCookie = setCookie.parse(refreshResponse);        
        const refreshTokenHash: string = createHash('sha256').update(signInCookie[0].value as string).digest('hex');

        // Verify original JWTs
        const accessToken = await jose.jwtVerify(signInResponse.body.access_token, accessSecret);
        const refreshToken = await jose.jwtVerify(signInCookie[0].value, refreshSecret);

        // Verify new JWTs
        const newAccessToken = await jose.jwtVerify(refreshResponse.body.access_token, accessSecret);
        const newRefreshToken = await jose.jwtVerify(refreshCookie[0].value, refreshSecret);

        // Check redis connection
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        
        // query redis with refresh token hash
        const redisQuery = await redisClient
        .multi()
        // get expiry timestamp
        .get(refreshTokenHash)
        // get ttl in seconds
        .ttl(refreshTokenHash)
        .exec();       

        // Assert
        expect(newAccessToken).toBeDefined;
        expect(newRefreshToken).toBeDefined;

        expect(newAccessToken.payload.jti).not.toEqual(accessToken.payload.jti);
        expect(newRefreshToken.payload.jti).not.toEqual(refreshToken.payload.jti);

        expect(newAccessToken.payload.fingerprint).not.toEqual(accessToken.payload.fingerprint);
        expect(newRefreshToken.payload.fingerprint).not.toEqual(refreshToken.payload.fingerprint);

        expect(newAccessToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
        expect(newRefreshToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));

        expect(newRefreshToken.payload.exp).toEqual(refreshToken.payload.exp);        
        expect(refreshCookie[0].maxAge * 1000).toBeLessThanOrEqual((refreshToken.payload.exp * 1000) - Date.now());

        expect(redisQuery[0]).toEqual(refreshToken.payload.exp.toString());
        expect(redisQuery[1]).toBeLessThanOrEqual(3600);
    });
    
    test('request should fail due to invalid token', async () => {
        // Act        
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
            .get("/auth/token")
            .auth(signInResponse.body.access_token, {type: 'bearer'})
            .set('Cookie', [`__Secure-refreshToken=${signInResponse.body.access_token}; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Strict; ${signInResponse.header['set-cookie'][2]}; ${signInResponse.header['set-cookie'][1]}`])
            .send()
            .expect(401);
        
        // Assert
        expect(refreshResponse.header['set-cookie']).not.toBeDefined;
        expect(refreshResponse.body.access_token).not.toBeDefined;
    });

    test('request should fail due to expired token', async () => {        
        // Get fingerprint from cookie
        let parts = signInResponse.header['set-cookie']
        parts = parts[1].split(';')
        const value = parts[0].split('=')[1]
        
        // import private key
        const refreshPrivateKey = await jose.importJWK(jwks.REFRESH_TOKEN_SECRET, 'EdDSA');
        // Hash fingerprint for token
        const hash: string = createHash('sha256').update(value).digest('hex');
        // Generate expired access token and refresh token
        const expiredRefreshToken = await createToken(hash, savedUser._id as string, Date.now() - 3_600_000, refreshPrivateKey);

        // Act
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
            .get("/auth/token")
            .auth(signInResponse.body.access_token, {type: 'bearer'})
            .set('Cookie', [`__Secure-refreshToken=${expiredRefreshToken}; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Strict; ${signInResponse.header['set-cookie'][2]}; ${signInResponse.header['set-cookie'][1]}`])
            .send()
            .expect(418);

        // Assert
        expect(refreshResponse.header['set-cookie']).not.toBeDefined;
        expect(refreshResponse.body.access_token).not.toBeDefined;
    });

    test('request should fail due to missing fingerprint', async () => {
        // Act        
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
            .get("/auth/token")
            .auth(signInResponse.body.access_token, {type: 'bearer'})
            // send refresh token cookie only
            .set('Cookie', signInResponse.header['set-cookie'][0])
            .send()
            .expect(401);
        
        // Assert
        expect(refreshResponse.header['set-cookie']).not.toBeDefined;
        expect(refreshResponse.body.access_token).not.toBeDefined;        
    });

    test('request should fail due to missing token', async () => {
        // Act
        // Request refresh token
        const refreshResponse: supertest.Response = await supertest(app)
            .get("/auth/token")
            .auth(signInResponse.body.access_token, {type: 'bearer'})
            // send fingerprint cookies
            .set('Cookie', `${signInResponse.header['set-cookie'][2]}; ${signInResponse.header['set-cookie'][1]}`)
            .send()
            .expect(401);

        // Assert
        expect(refreshResponse.header['set-cookie']).not.toBeDefined;
        expect(refreshResponse.body.access_token).not.toBeDefined;
    });
});