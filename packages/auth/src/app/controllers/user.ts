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