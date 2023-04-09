import { faker } from "@faker-js/faker";
import { createToken } from "./createToken";
import { KeyLike, importJWK, jwtVerify } from "jose";
import { REFRESH_TOKEN_SECRET, REFRESH_TOKEN_PUBLIC } from '../../jwks'

describe('create JSON Web Tokens', () => { 
    test('make sure JWT is created with correct parameters', async () => {
        // Arrange
        const privateKey: KeyLike | Uint8Array = await importJWK(REFRESH_TOKEN_SECRET, 'EdDSA');
        const fingerprint: string = faker.datatype.uuid();
        const sub: string = faker.datatype.string(12);
        const exp: number = Date.now() + 3_600_000;
        const publicKey: KeyLike | Uint8Array = await importJWK(REFRESH_TOKEN_PUBLIC, 'EdDSA')

        // Act
        const token = createToken(fingerprint, sub, exp, privateKey);
        const verifyToken = await jwtVerify(await token, publicKey, {
            algorithms: ['EdDSA'],
            issuer: 'https://auth.brewica.com',
            audience: 'https://www.brewica.com'
        });
        
        // Assert
        expect(verifyToken.protectedHeader.alg).toEqual('EdDSA');
        expect(verifyToken.payload.iss).toEqual('https://auth.brewica.com');
        expect(verifyToken.payload.aud).toEqual('https://www.brewica.com');
        expect(verifyToken.payload.jti).toHaveLength(36);
        expect(verifyToken.payload.sub).toEqual(sub);
        expect(verifyToken.payload.exp).toEqual(exp);
        expect(verifyToken.payload.fingerprint).toEqual(fingerprint);
    });
});