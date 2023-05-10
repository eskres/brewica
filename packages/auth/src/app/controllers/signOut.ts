import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import * as jose from 'jose';
import * as jwks from '../../jwks';
import { redisClient } from '../../utils/redis';

export const signOut = async (req: Request, res: Response) => {
    // check req for cookies
    if(!req.cookies['__Secure-refreshToken']) return res.sendStatus(205);
    // Get refresh token
    const refreshToken = req.cookies['__Secure-refreshToken'];
    // hash token
    const refreshTokenHash: string = createHash('sha256').update(refreshToken as string).digest('hex');

    // Import JWKS
    const refreshPublicKey = await jose.importJWK(jwks.REFRESH_TOKEN_PUBLIC, 'EdDSA')

    // Verify JWT
    const jwt = await jose.jwtVerify(refreshToken, refreshPublicKey, {
        algorithms: ['EdDSA'],
        issuer: 'https://auth.brewica.com',
        audience: 'https://www.brewica.com'
    });

    if (!redisClient.isOpen) {
        await redisClient.connect()
        .catch((err) => {
            console.log(err);
            redisClient.quit();
            return res.sendStatus(500);
        });
    }

    // Add token to blacklist and set expiry time
    redisClient.set(refreshTokenHash, jwt.payload.exp as number, {'EXAT': jwt.payload.exp as number})
        .then(()=>{
            // Close redis client
            redisClient.quit();
        });
    
    // Clear cookies
    res.clearCookie('__Secure-accessFingerprint', { httpOnly: true, secure: true, sameSite: "strict" });
    res.clearCookie('__Secure-refreshFingerprint', { httpOnly: true, secure: true, sameSite: "strict" });
    res.clearCookie('__Secure-refreshToken', { httpOnly: true, secure: true, sameSite: "strict" });
    return res.sendStatus(205);
}