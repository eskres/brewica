import { NextFunction, Request, Response } from 'express'
// import mongoose = require('mongoose');
import UserModel from '../models/User';
import * as argon2 from "argon2";
import * as dns from "dns"

// Require jsonwebtoken
// import jwt = require("jsonwebtoken")

export const signupPost = async (req: Request, res: Response, next: NextFunction) => {
    const username: string = req.body.username.toString()
    const email: string = req.body.emailAddress.toString()
    const password: string = req.body.password.toString();
    
    const usernameExists = await UserModel.findOne({username: username}).exec();
    const emailExists = await UserModel.findOne({emailAddress: email}).exec();
    
     const hashPassword = async function(password: string){
         const hash = await argon2.hash(password, {
             type: argon2.argon2id,
             memoryCost: 15_360, // in KiB. Minimum of 15 Mib required.
             timeCost: 2, // Minimum time cost of 2 required
             parallelism: 1 // Minimum parallelism of 1 required
        });
        if (hash.length === 97 && hash.startsWith('$argon2id$') && hash !== password) {
            return req.body.password = hash;
        } else {
            return(res.status(500).json({message:'Password encryption failed please contact site administrator'}));
        }
    }
    
    // Validate password
    const validatePassword = new Promise((resolve, reject) => {
        if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!#$%&'*+/=?^_‘{|}~-])[A-Za-z\d!#$%&'*+/=?^_‘{|}~-]{8,}/)) {
            reject(res.status(400).json({message:`Password requires 8 or more characters with a mix of letters, numbers & symbols`}));
        }
        resolve(password)
    });

    // Validate email address

   const validateEmail = async (email: string) => {       
        if (emailExists) {
            return Promise.reject(res.status(409).json({message:`Email address "${email}" is already registered`}));
        } 
        const host = email.split('@')[1];
        await dns.promises.resolveMx(host).catch((err) => {            
            if (err.hostname === host) {
                return Promise.reject(res.status(400).json({message:`Email address invalid, provider "${host}" cannot be reached`}))
            }
        });
        return Promise.resolve();
    };

    // Validate username
    const validateUsername = new Promise ((resolve, reject) => {        
        if (usernameExists) {    
            reject(res.status(409).json({message:`Username "${username}" is already registered`}));
        }
        if (!username.match(/^[\w-]{1,28}$/)) {
            reject(res.status(400).json({message:'Usernames must be no longer than 28 characters and are not case sensitive. Only letters, numbers, dashes and underscores are permitted.'}));
        }
        console.log(username);
        req.body.username = username.toLowerCase();
        resolve(username);
    });
    
    Promise.all([
        validatePassword,
        hashPassword(password),
        validateEmail(email),
        validateUsername
    ])

    .then(() => {
        const user = new UserModel(req.body);
        user.save().then(()=>{
            return res.status(200).json({message: "Account created successfully"});
        })
    })

    .catch((err: Error) => {
        if(err instanceof Error){
            next(err);
        }
    });
}