import * as mongoose from 'mongoose';

export interface User {
  username: string;
  emailAddress: string;
  password: string;
  passwordConf: string;
  token?: string;
  verified: boolean;
  expiresAt: Date;
}

const userSchema = new mongoose.Schema<User>({ 
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
    
const UserModel: mongoose.Model<User> = mongoose.model<User>('UserModel', userSchema);

export default UserModel;