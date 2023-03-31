import { SignJWT, KeyLike } from "jose";
import { randomUUID } from "crypto";

export function createToken(fingerprint: string, sub: string, exp: string | number, secret: KeyLike | Uint8Array) {
    return new SignJWT({fingerprint: fingerprint})
        .setSubject(sub)
        .setProtectedHeader({alg: 'EdDSA'})
        .setIssuedAt()
        .setIssuer('https://auth.brewica.com')
        .setAudience('https://www.brewica.com')
        .setExpirationTime(exp)
        .setJti(randomUUID())
        .sign(secret);
}