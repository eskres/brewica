import { NextFunction, Request, Response } from 'express'
// import mongoose = require('mongoose');
import UserModel, { User } from '../models/User';
import * as argon2 from "argon2";
import * as dns from "dns"
import  { transport } from '../../utils/nodemailer'
import { SendMailOptions } from 'nodemailer';

// Require jsonwebtoken
// import jwt = require("jsonwebtoken")

export const signupPost = async (req: Request, res: Response, next: NextFunction) => {
    const username: string = req.body.username.toString().toLowerCase();
    const email: string = req.body.emailAddress.toString();
    const password: string = req.body.password.toString();
    const token: string = crypto.randomUUID();
    req.body.token = token;

    const info: SendMailOptions = {
        from: `'"Brewica" <${process.env.SMTP_SENDER}>'`,
        to: email,
        subject: `Verify your email to start using Brewica`,
        text: `Hi ${username}! Thanks for signing up to Brewica. Before we can continue, we need to validate your email address. ${process.env.APP_URL}/user/verify?t=${token}`,
        html: `<p>Hi ${username}!</p> <p>Thanks for signing up to Brewica. Before we can continue, we need to validate your email address.</p><strong><a href="${process.env.APP_URL}/user/verify?t=${token}" target="_blank">Verify email address</a></strong>`,
    };

    try{
    
    // Validate password
    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!#$%&'*+/=?^_‘{|}~-])[A-Za-z\d!#$%&'*+/=?^_‘{|}~-]{8,}/)) {
        return res.status(400).json({message:`Password requires 8 or more characters with a mix of letters, numbers & symbols`});
    }
    if (password !== req.body.passwordConf) {        
        return res.status(400).json({message:'Passwords do not match'});
    }
    
    // Hash password
    const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 15_360, // in KiB. Minimum of 15 Mib required.
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
    const usernameExists = await UserModel.findOne({username: username}).exec();
    if (usernameExists) {    
        return(res.status(409).json({message:`Username "${username}" is already registered`}));
    }

    if (!username.match(/^[\w\-.]{1,28}$/)) {
        return res.status(400).json({message:'Usernames must be no longer than 28 characters and are not case sensitive. Only letters, numbers, dashes and underscores are permitted.'});

    }
    req.body.username = username; 
        
    // Validate email
    const emailExists = await UserModel.findOne({emailAddress: email}).exec();
    if (emailExists) {
        return (res.status(409).json({message:`Email address "${email}" is already registered`}));
    } 
    const host = email.split('@')[1];
    await dns.promises.resolveMx(host).catch(() => {
        return res.status(400).json({message:`Email address invalid, provider "${host}" cannot be reached`});
    });
    
    if (!res.headersSent) {
        // Send verification email
        await transport.sendMail(info)
        .catch((err) => {
            console.log(err);
            return res.status(500).json({message:'Email verification failed please contact site administrator'});
        })
        // Save to database
        const user = new UserModel(req.body);
        user.save()
        .then(()=>{
            return res.status(200).json({message: "Account created successfully"});
        })
        .catch((err: Error) => {
            // How best to handle errors here???
            console.log(err);
            next(err);
        });
    }
    // Catch unhandled errors
    } catch(err) {
        // How best to handle errors here???
        next(err);
    };
}