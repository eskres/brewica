import * as mongoose from 'mongoose';
import type { IUser } from '../../../../types'

const userSchema = new mongoose.Schema<IUser>({ 
    username: { type: String, required: true, lowercase: true, unique: true },
    emailAddress: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String,
                required: true,
                minlength: 8,
                maxlength: 256},
    token: { type: String, required: true, lowercase: true, unique: true },
    verified: {type: Boolean, default: false},
    expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000}
},{ timestamps: true });
    
userSchema.index({expiresAt: 1}, {
  expireAfterSeconds: 0,
  partialFilterExpression: { 'verified': false }
});

const User: mongoose.Model<IUser> = mongoose.model<IUser>('user', userSchema);

export default User;