import type { Request, Response } from 'express';
import User from '../models/User';
import mongoose from 'mongoose';

export const user = async (req: Request, res: Response) => {    
    const id = new mongoose.Types.ObjectId(req.body.jwt.payload.sub);
    try {
        const user = await User.findById(id).orFail().exec();
        return res.status(200).json({user: user});
    } catch (err) {
        if (err instanceof mongoose.Error.DocumentNotFoundError) return res.status(404).json({message: 'User not found'});
        console.log(err);
        return res.status(500).json({message: 'Server error'});
    }
}

export const exists = async (req: Request, res: Response) => {    
    const username: string = req.body.username
    try {
        const exists = await User.findOne({username: username}).exec();
        return exists ? res.status(200).json({exists: true}) : res.status(200).json({exists: false});
    } catch (err) {
        console.log(err);
        return res.status(500).json({Error: 'Internal server error'});
    }
}