import express from 'express';
import { signUpPost } from '../controllers/signUp';
import { signInPost } from '../controllers/signIn';
import { refreshToken } from '../controllers/refreshToken';
import { signOut } from '../controllers/signOut';

const authRouter: express.Router = express.Router();

authRouter.post("/auth/signup", signUpPost);
authRouter.post("/auth/signin", signInPost);
authRouter.get("/auth/token", refreshToken);
authRouter.get("/auth/signout", signOut);

export default authRouter;