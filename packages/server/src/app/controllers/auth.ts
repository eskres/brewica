import { NextFunction, Request, Response } from 'express'
// import mongoose = require('mongoose');
import UserModel from '../models/User';
import * as argon2 from "argon2";
import * as dns from "dns"

// Require jsonwebtoken
// import jwt = require("jsonwebtoken")

export const signupPost = async (req: Request, res: Response, next: NextFunction) => {
    const username: string = req.body.username.toString().toLowerCase();
    const email: string = req.body.emailAddress.toString();
    const password: string = req.body.password.toString();
    
    // Validate password
    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!#$%&'*+/=?^_‘{|}~-])[A-Za-z\d!#$%&'*+/=?^_‘{|}~-]{8,}/)) {
        return(res.status(400).json({message:`Password requires 8 or more characters with a mix of letters, numbers & symbols`}));
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
        return(res.status(500).json({message:'Password encryption failed please contact site administrator'}));
    }
    
    // Validate username
    const usernameExists = await UserModel.findOne({username: username}).exec();
    if (usernameExists) {    
        return(res.status(409).json({message:`Username "${username}" is already registered`}));
    }
    if (!username.match(/^[\w\-.]{1,28}$/)) {
        return(res.status(400).json({message:'Usernames must be no longer than 28 characters and are not case sensitive. Only letters, numbers, dashes and underscores are permitted.'}));
    }
    req.body.username = username;
    
    // Validate email
    const emailExists = await UserModel.findOne({emailAddress: email}).exec();
    if (emailExists) {
        return (res.status(409).json({message:`Email address "${email}" is already registered`}));
    } 
    const host = email.split('@')[1];
    await dns.promises.resolveMx(host).catch((err) => {
        if (err) {
            return Promise.reject(res.status(400).json({message:`Email address invalid, provider "${host}" cannot be reached`}))
        }
    })
    
    // Save to database
    .then(() => {
        const user = new UserModel(req.body);
        user.save().then(()=>{
            return res.status(200).json({message: "Account created successfully"});
        })
    })
    // Catch unhandled errors
    .catch((err) => {
        if(err instanceof Error){
            console.log(err);
            next(err);
        }
    })

    // try{
    // } catch(err) {
    // };
}