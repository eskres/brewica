import type { Request, Response } from 'express'
import { redisClient } from '../../utils/redis';
import { createFingerprint } from '../../utils/createFingerprint';
import * as jose from 'jose';
import * as jwks from '../../../jwks';
import { createToken } from '../../utils/createToken'
import { createHash } from 'crypto';


export const refreshToken = async(req: Request, res: Response) => {    
    // Check refresh token and user context / fingerprint actually exist in cookies
    if(!req.cookies['__Secure-refreshToken'] || !req.cookies['__Secure-refreshFingerprint']) return res.sendStatus(401);

    // Import JWKS
    const accessPrivateKey = await jose.importJWK(jwks.ACCESS_TOKEN_SECRET, 'EdDSA')
    const refreshPublicKey = await jose.importJWK(jwks.REFRESH_TOKEN_PUBLIC, 'EdDSA')
    const refreshPrivateKey = await jose.importJWK(jwks.REFRESH_TOKEN_SECRET, 'EdDSA')
    // Get refresh token
    const refreshToken = req.cookies['__Secure-refreshToken'];
    
    // Get unhashed fingerprint
    const fingerprint = req.cookies['__Secure-refreshFingerprint'];
    
    // Verify JWT
    await jose.jwtVerify(refreshToken, refreshPublicKey, {
        algorithms: ['EdDSA'],
        issuer: 'https://auth.brewica.com',
        audience: 'https://www.brewica.com'
    })
    .then(async (jwt) => {
        // Check redis client isn't already open before connecting
        if (!redisClient.isOpen) {
            await redisClient.connect()
            .catch((err) => {
                console.log(err);
                redisClient.quit();
                return res.sendStatus(500);
            });
        }
        // Check refresh token isn't blacklisted
        if (await redisClient.exists(refreshToken) !== 0) {
            redisClient.quit();
            return res.sendStatus(401);
        }
        
        // Check hashed fingerprint and user id exist in JWT
        if(!jwt.payload['fingerprint'] || !jwt.payload['sub']) return res.sendStatus(401);
        // Hash fingerprint
        const fingerprintHash: string = createHash('sha256').update(fingerprint).digest('hex');
        // Compare fingerprint hashes
        if(jwt.payload['fingerprint'] as string !== fingerprintHash) return res.sendStatus(401);
        
        // Generate new fingerprints and hashes
        const accessFingerprint = createFingerprint();
        const refreshFingerprint = createFingerprint();

        // Generate new access token and refresh token
        const accessToken = await createToken(accessFingerprint.hash, jwt.payload['sub'] as string, '10m', accessPrivateKey);
        const newRefreshToken = await createToken(refreshFingerprint.hash, jwt.payload['sub'] as string, jwt.payload.exp as number, refreshPrivateKey);
        
        // Add old token to blacklist and set expiry time
        redisClient.set(refreshToken, jwt.payload.sub, {'EXAT': jwt.payload.exp as number});
        // Close redis client
        redisClient.quit();

        // Calculate max age for cookies
        const maxAge: number = Math.floor((jwt.payload.exp as number * 1000) - Date.now());    
        
        // Set cookies
        res.cookie("__Secure-refreshToken", newRefreshToken, {httpOnly: true, secure: true, sameSite: "strict", maxAge: maxAge});
        res.cookie("__Secure-accessFingerprint", accessFingerprint.value, {httpOnly: true, secure: true, sameSite: "strict", maxAge: maxAge});
        res.cookie("__Secure-refreshFingerprint", refreshFingerprint.value, {httpOnly: true, secure: true, sameSite: "strict", maxAge: maxAge});
        
        // Issue new access token
        return res.status(200).json({accessToken: accessToken});
    })
    .catch((err) => {
        console.log(err);
        return res.sendStatus(401);
    });
}