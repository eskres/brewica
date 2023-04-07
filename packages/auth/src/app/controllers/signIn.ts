import type { Request, Response } from 'express'
import User from '../models/User';
import * as argon2 from "argon2";
import * as jose from 'jose';
import * as jwks from '../../../jwks';
import { createToken } from '../../utils/createToken'
import { createFingerprint } from '../../utils/createFingerprint';

export const signInPost = async (req: Request, res: Response) => {
    const accessFingerprint = createFingerprint();
    const refreshFingerprint = createFingerprint();
    const {emailAddress, password} = req.body;

    try{       
        const user = await User.findOne({emailAddress})
        if(!user){ return res.status(400).json({message: "Account not found"}); }
        
        const passwordMatch = await argon2.verify(user.password, password);
        if(!passwordMatch){ return res.status(400).json({message: "Password incorrect"}); }
        
        if (!res.headersSent) {           
            // To generate new key pairs...
            // const { publicKey, privateKey } = generateKeyPairSync('ed25519');
            // console.log(publicKey.export({format: 'jwk'}))
            // console.log(privateKey.export({format: 'jwk'}))

            const accessSecret = await jose.importJWK(jwks.ACCESS_TOKEN_SECRET, 'EdDSA');
            const refreshSecret = await jose.importJWK(jwks.REFRESH_TOKEN_SECRET, 'EdDSA');

            const accessToken = await createToken(accessFingerprint.hash,  user._id, '10m', accessSecret);
            const refreshToken = await createToken(refreshFingerprint.hash, user._id, '60m', refreshSecret);

            res.cookie("__Secure-refreshToken", refreshToken, {httpOnly: true, secure: true, sameSite: "strict", maxAge: 3_600_000});
            res.cookie("__Secure-accessFingerprint", accessFingerprint.value, {httpOnly: true, secure: true, sameSite: "strict", maxAge: 600_000});
            res.cookie("__Secure-refreshFingerprint", refreshFingerprint.value, {httpOnly: true, secure: true, sameSite: "strict", maxAge: 3_600_000});

            return res.status(200).json({accessToken: accessToken});
        }
    } catch(error) {
        console.log(error)
        res.status(500).json({"message": "Sign in failed"});
    }
}