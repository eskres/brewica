import type { Request, Response, NextFunction } from "express";
import { importJWK, jwtVerify } from "jose";
import { ACCESS_TOKEN_PUBLIC } from '../../../jwks'
import { createHash } from 'crypto';

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {

    const publicKey = await importJWK(ACCESS_TOKEN_PUBLIC, 'EdDSA');
    
    if (!req.body.accessToken) return res.sendStatus(403);
    if (!req.cookies['__Secure-accessFingerprint']) return res.sendStatus(403);

    await jwtVerify(req.body.accessToken, publicKey, {
        algorithms: ['EdDSA'],
        issuer: 'https://auth.brewica.com',
        audience: 'https://www.brewica.com'
    }).then((jwt)=>{
        const fingerprint = jwt.payload['fingerprint']        
        // Hash fingerprint
        const fingerprintHash: string = createHash('sha256').update(req.cookies['__Secure-accessFingerprint'] as string).digest('hex');
        // Compare fingerprint hashes
        if(fingerprint as string !== fingerprintHash) return res.sendStatus(403);
    })
    .catch((err) => {
        // console.log(err);
        if (err) return res.sendStatus(403);
    })
    next();
}