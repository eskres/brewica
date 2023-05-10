import type { Request, Response, NextFunction } from "express";
import { importJWK, jwtVerify } from "jose";
import { ACCESS_TOKEN_PUBLIC } from '../../jwks'
import { createHash } from 'crypto';

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {

    let token: string | undefined;
    const publicKey = await importJWK(ACCESS_TOKEN_PUBLIC, 'EdDSA');
    
    if (req.headers['authorization'] === undefined) {
        return res.sendStatus(403);
    } else {
        const parts = req.headers['authorization'].split(' ');        
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    if (!req.cookies['__Secure-accessFingerprint']) return res.sendStatus(403);

    await jwtVerify(token as string, publicKey, {
        algorithms: ['EdDSA'],
        issuer: 'https://auth.brewica.com',
        audience: 'https://www.brewica.com'
    }).then((jwt)=>{
        const fingerprint = jwt.payload['fingerprint']        
        // Hash fingerprint
        const fingerprintHash: string = createHash('sha256').update(req.cookies['__Secure-accessFingerprint'] as string).digest('hex');
        // Compare fingerprint hashes
        if(fingerprint as string !== fingerprintHash) return res.sendStatus(403);
        // Check access token expiry is in the future
        if (jwt.payload['exp'] as number <= Date.now()) return res.sendStatus(401);
        // Add jwt to the request
        req.body.jwt = jwt;

        return next();
    })
    .catch((err) => {
        console.log(err);
        return res.sendStatus(403);
    })
    return;
}