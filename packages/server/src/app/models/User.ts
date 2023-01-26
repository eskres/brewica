import mongoose = require('mongoose');

export interface User {
  username: string;
  emailAddress: string;
  password: string;
}

const userSchema = new mongoose.Schema<User>({ 
    username: { type: String, required: true, lowercase: true, unique: true },
    emailAddress: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String,
                required: true,
                minlength: 8,
                maxlength: 256},
},{ timestamps: true });
    
const UserModel: mongoose.Model<User> = mongoose.model<User>('UserModel', userSchema);

export default UserModel;