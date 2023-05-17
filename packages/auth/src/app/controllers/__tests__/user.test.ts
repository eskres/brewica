import { connectDB, dropDB, dropCollections } from '../../../testUtils/mongoMemoryServer';
import type { IUser, ISignIn } from '../../../../../types';
import supertest from 'supertest';
import { faker } from '@faker-js/faker';
import User from '../../models/User';
import { app } from '../../../main';
import { createToken } from '../../../utils/createToken';
import { createFingerprint } from '../../../utils/createFingerprint';
import {ACCESS_TOKEN_SECRET} from '../../../jwks';
import { importJWK, type KeyLike } from 'jose';
import mongoose from 'mongoose';

beforeAll(async () => {
    await connectDB();
});

afterEach(async () => {
    await dropCollections();
});

afterAll(async () => {
    await dropDB();
});


describe.only('User GET /auth/user and User GET /auth/user/exists', () => {
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

    // Check the route is protected by the verifyAccessToken middleware here
    test('request with no access token should return 403', async () => {        
        await supertest(app)
        .get('/auth/user')
        .set('Cookie', signInResponse.headers['set-cookie'])
        .expect(403);
    });

    test('request with no fingerprint should return 403', async () => {
        await supertest(app)
        .get('/auth/user')
        .auth(signInResponse.body['access_token'], {type: 'bearer'})
        .expect(403);
    });

    // Check the contoller here
    test('request with invalid user id should return 404', async () => {
        const privateKey: KeyLike | Uint8Array = await importJWK(ACCESS_TOKEN_SECRET, 'EdDSA');
        const fingerprint = createFingerprint();
        const sub = new mongoose.Types.ObjectId;
        const exp: number = Date.now() + 3_600_000;        

        const token = await createToken(fingerprint.hash, sub as unknown as string, exp, privateKey);

        const response = await supertest(app)
        .get('/auth/user')
        .auth(token, {type: 'bearer'})
        .set('Cookie', `${signInResponse.header['set-cookie'][0]}; __Secure-accessFingerprint=${fingerprint.value}; ${signInResponse.header['set-cookie'][2]}`)
        .expect(404);

        expect(response.body.message).toEqual('User not found');
    });

    test('request with valid access token and fingerprint should return a user object', async () => {
        const response = await supertest(app)
        .get('/auth/user')
        .auth(signInResponse.body['access_token'], {type: 'bearer'})
        .set('Cookie', signInResponse.headers['set-cookie'])
        .expect(200);
        
        expect(response.body.user).toBeDefined();
    });

    test('request with pre existing username should return true', async () => {
        const response = await supertest(app)
        .get('/auth/user/exists')
        .send({username: savedUser.username})
        .expect(200);
        
        expect(response.body.exists).toBeDefined();
        expect(response.body.exists).toEqual(true);
    });

    test('request with new username should return false', async () => {
        const response = await supertest(app)
        .get('/auth/user/exists')
        .send({username: faker.internet.userName()})
        .expect(200);
        
        expect(response.body.exists).toBeDefined();
        expect(response.body.exists).toEqual(false);
    });
})