import { faker } from "@faker-js/faker";
import { KeyLike, importJWK, SignJWT, generateKeyPair } from "jose";
import { randomUUID, createHash } from "crypto";
import { ACCESS_TOKEN_SECRET } from '../../../../jwks'
import { verifyAccessToken } from '../verifyAccessToken'
import supertest from 'supertest';
import { app } from '../../../main';

describe('verify the validity of access token with verifyAccessToken.ts middleware', () => {

    let fingerprint: string;
    let sub: string;
    let exp: number;
    let privateKey: KeyLike | Uint8Array;
    let fingerprintHash: string;

    // temporary endpoint that uses the middleware
    app.get('/test', verifyAccessToken, (req, res) => {
        res.sendStatus(200);
    });

    beforeEach(async () => {
        fingerprint = randomUUID();
        sub = faker.datatype.string(12);
        exp = Date.now() + 3_600_000;
        privateKey = await importJWK(ACCESS_TOKEN_SECRET, 'EdDSA');
        fingerprintHash = createHash('sha256').update(fingerprint).digest('hex');
    });

    test('send request with no token and receive 403', async () => {
        await supertest(app)
            .get("/test")
            .send()
            .expect(403);
    });

    test('send request with invalid token (alg other than EdDSA) and receive 403', async () => {

        const keys = await generateKeyPair('RS256');

        const token = await new SignJWT({fingerprint: fingerprintHash})
            .setSubject(sub)
            .setProtectedHeader({alg: 'RS256'})
            .setIssuedAt()
            .setIssuer('https://auth.brewica.com')
            .setAudience('https://www.brewica.com')
            .setExpirationTime(exp)
            .setJti(randomUUID())
            .sign(keys.privateKey);

        await supertest(app)
            .get("/test")
            .set('Cookie', [`__Secure-accessFingerprint=${fingerprint}`])
            .send({accessToken: token})
            .expect(403);
    });
    
    test('send request with invalid token (issuer) and receive 403', async () => {
        const token = await new SignJWT({fingerprint: fingerprintHash})
            .setSubject(sub)
            .setProtectedHeader({alg: 'EdDSA'})
            .setIssuedAt()
            .setIssuer('fail')
            .setAudience('https://www.brewica.com')
            .setExpirationTime(exp)
            .setJti(randomUUID())
            .sign(privateKey);

        await supertest(app)
            .get("/test")
            .set('Cookie', [`__Secure-accessFingerprint=${fingerprint}`])
            .send({accessToken: token})
            .expect(403);
    });

    test('send request with invalid token (audience) and receive 403', async () => {
        const token = await new SignJWT({fingerprint: fingerprintHash})
            .setSubject(sub)
            .setProtectedHeader({alg: 'EdDSA'})
            .setIssuedAt()
            .setIssuer('https://auth.brewica.com')
            .setAudience('fail')
            .setExpirationTime(exp)
            .setJti(randomUUID())
            .sign(privateKey);

        await supertest(app)
            .get("/test")
            .set('Cookie', [`__Secure-accessFingerprint=${fingerprint}`])
            .send({accessToken: token})
            .expect(403);
    });

    test('send request with invalid token (fingerprint) and receive 403', async () => {
        const token = await new SignJWT({fingerprint: faker.datatype.string(64)})
            .setSubject(sub)
            .setProtectedHeader({alg: 'EdDSA'})
            .setIssuedAt()
            .setIssuer('https://auth.brewica.com')
            .setAudience('https://www.brewica.com')
            .setExpirationTime(exp)
            .setJti(randomUUID())
            .sign(privateKey);

        await supertest(app)
            .get("/test")
            .set('Cookie', [`__Secure-accessFingerprint=${fingerprint}`])
            .send({accessToken: token})
            .expect(403);
    });

    test('send request with valid token and receive 200', async () => {
        const token = await new SignJWT({fingerprint: fingerprintHash})
            .setSubject(sub)
            .setProtectedHeader({alg: 'EdDSA'})
            .setIssuedAt()
            .setIssuer('https://auth.brewica.com')
            .setAudience('https://www.brewica.com')
            .setExpirationTime(exp)
            .setJti(randomUUID())
            .sign(privateKey);
            
            await supertest(app)
            .get("/test")
            .set('Cookie', [`__Secure-accessFingerprint=${fingerprint}`])
            .send({accessToken: token})
            .expect(200);
    });
});