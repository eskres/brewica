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

beforeAll(async () => {
    await connectDB();
});
afterEach(async () => {
    await dropCollections();
});
afterAll(async () => {
    await dropDB;
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
        await supertest(app)
        .post("/auth/signup")
        .send(newUser)
        .expect(200);;
        return savedUser = await User.findOne({emailAddress: newUser.emailAddress});
    });

    test('catch an incorrect password and send error message to user', async () => {
        
        // Arrange
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: 'password',
        });

        // Act
        const response = await supertest(app)
        .post("/auth/signin")
        .send(testUser)
        .expect(400);

        // Assert
        expect(response.body.message).toEqual("Password incorrect");
    });

    test('catch a non existant account and send error message to user', async () => {
        // Arrange
        const testUser: ISignIn = ({
            emailAddress: 'test@test.com',
            password: password,
        });

        // Act
        const response = await supertest(app)
        .post("/auth/signin")
        .send(testUser)
        .expect(400);

        // Assert
        expect(response.body.message).toEqual("Account not found");
    });

    test('a successful sign in should respond with JWT access token and refresh token', async () => {
        // Arrange
        const testUser: ISignIn = ({
            emailAddress: savedUser.emailAddress,
            password: password,
        });

        const accessSecret = await jose.importJWK(jwks.ACCESS_TOKEN_PUBLIC, 'EdDSA');
        const refreshSecret = await jose.importJWK(jwks.REFRESH_TOKEN_PUBLIC, 'EdDSA');

        // Act
        const response: supertest.Response = await supertest(app)
        .post("/auth/signin")
        .send(testUser)
        .expect(200);
        const cookie = setCookie.parse(response);
        
        const accessToken = await jose.jwtVerify(response.body.accessToken, accessSecret);
        const refreshToken = await jose.jwtVerify(cookie[0].value, refreshSecret);
        
        // Assert
        expect(cookie[0].name).toEqual('__Secure-refreshToken');
        expect(cookie[1].name).toEqual('__Secure-accessFingerprint');
        expect(accessToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
        expect(refreshToken.payload).toEqual(expect.objectContaining({sub: savedUser._id.toString()}));
    });
});