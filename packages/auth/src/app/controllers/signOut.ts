import type { Request, Response } from 'express'
import * as jose from 'jose';
import * as jwks from '../../../jwks';
import { redisClient } from '../../utils/redis';

export const signOut = async (req: Request, res: Response) => {
    // check req for cookies
    if(!req.cookies['__Secure-refreshToken']) return res.sendStatus(205);

    // Import JWKS
    const refreshPublicKey = await jose.importJWK(jwks.REFRESH_TOKEN_PUBLIC, 'EdDSA')
    // Get refresh token
    const refreshToken = req.cookies['__Secure-refreshToken'];

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

    // Add old token to blacklist and set expiry time
    redisClient.set(refreshToken, jwt.payload.sub as string, {'EXAT': jwt.payload.exp as number});
    // Close redis client
    redisClient.quit();
    
    // Clear cookies
    res.clearCookie('__Secure-accessFingerprint', { httpOnly: true, secure: true, sameSite: "strict" });
    res.clearCookie('__Secure-refreshFingerprint', { httpOnly: true, secure: true, sameSite: "strict" });
    res.clearCookie('__Secure-refreshToken', { httpOnly: true, secure: true, sameSite: "strict" });
    return res.sendStatus(205);
}