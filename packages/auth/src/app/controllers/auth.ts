import type { NextFunction, Request, Response } from 'express'
import User from '../models/User';
import * as argon2 from "argon2";
import * as dns from "dns";
import  { transport } from '../../utils/nodemailerTransport';
import type { SendMailOptions } from 'nodemailer';
import { randomUUID, createHash } from 'crypto';
import * as jose from 'jose';
import * as jwks from '../../../jwks';
import { createToken } from '../../utils/createToken'
import { createFingerprint } from '../../utils/createFingerprint';
import { redisClient } from '../../utils/redis';

export const signUpPost = async (req: Request, res: Response, next: NextFunction) => {
    const username: string = req.body.username.toString().toLowerCase();
    const email: string = req.body.emailAddress.toString();
    const password: string = req.body.password.toString();
    const token: string = randomUUID();
    req.body.token = token;

    const info: SendMailOptions = {
        from: `'"Brewica" <${process.env['SMTP_SENDER']}>'`,
        to: email,
        subject: `Verify your email to start using Brewica`,
        text: `Hi ${username}! Thanks for signing up to Brewica. Before we can continue, we need to validate your email address. ${process.env['APP_URL']}/user/verify?t=${token}`,
        html: `<p>Hi ${username}!</p> <p>Thanks for signing up to Brewica. Before we can continue, we need to validate your email address.</p><strong><a href="${process.env['APP_URL']}/user/verify?t=${token}" target="_blank">Verify email address</a></strong>`,
    }

    try{
    
    // Validate password
    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!#$%&'*+/=?^_‘{|}~-])[A-Za-z\d!#$%&'*+/=?^_‘{|}~-]{8,}/)) {
        return res.status(400).json({message:`Password requires 8 or more characters with a mix of letters, numbers & symbols`});
    }
    if (password !== req.body.passwordConf) {        
        return res.status(400).json({message:'Passwords do not match'});
    }
    
    // Hash password as per OWASP -> https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
    // TODO: *** ADD A PEPPER ***
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19_456, // in KiB. Minimum of 19 Mib required.
        timeCost: 2, // Minimum time cost of 2 required
        parallelism: 1 // Minimum parallelism of 1 required
    });
    
    // Validate hash    
    if (hash.length === 97 && hash.startsWith('$argon2id$') && hash !== password) {
        req.body.password = hash;
    } else {
        return res.status(500).json({message:'Password encryption failed please contact site administrator'});
    }
    
    // Validate username
    const usernameExists = await User.findOne({username: username}).exec();
    if (usernameExists) {    
        return(res.status(409).json({message:`Username "${username}" is already registered`}));
    }

    if (!username.match(/^[\w\-.]{1,28}$/)) {
        return res.status(400).json({message:'Usernames must be no longer than 28 characters and are not case sensitive. Only letters, numbers, dashes and underscores are permitted.'});

    }
    req.body.username = username;
        
    // Validate email
    const emailExists = await User.findOne({emailAddress: email}).exec();
    if (emailExists) {
        return (res.status(409).json({message:`Email address "${email}" is already registered`}));
    } 
    const host: string = email.split('@')[1] || '';
    await dns.promises.resolveMx(host).catch(() => {
        return res.status(400).json({message:`Email address invalid, provider "${host}" cannot be reached`});
    });
    
    if (!res.headersSent) {
        // Send verification email
        (await transport).sendMail(info)
        .catch((err: Error) => {
            console.log(err);
            return res.status(500).json({message:'Email verification failed please contact site administrator'});
        })
        // Save to database
        .then(()=>{
            const user = new User(req.body);
            user.save()
            return res.status(200).json({message: "Account created successfully"});
        })
        .catch((err: Error) => {
            // How best to handle errors here???
            console.log(err);
            next(err);
        });
    }
    // Catch unhandled errors
    } catch(err: unknown) {
        // How best to handle errors here???
        next(err);
    }
}

export const signInPost = async(req: Request, res: Response) => {

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
export const tokenRefresh = async(req: Request, res: Response) => {    
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
    })
}