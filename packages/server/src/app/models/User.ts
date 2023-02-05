import * as mongoose from 'mongoose';

export interface User {
  username: string;
  emailAddress: string;
  password: string;
  passwordConf: string;
  token?: string;
}

const userSchema = new mongoose.Schema<User>({ 
    username: { type: String, required: true, lowercase: true, unique: true },
    emailAddress: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String,
                required: true,
                minlength: 8,
                maxlength: 256},
    token: { type: String, required: true, lowercase: true, unique: true }
},{ timestamps: true });
    
const UserModel: mongoose.Model<User> = mongoose.model<User>('UserModel', userSchema);

export default UserModel;