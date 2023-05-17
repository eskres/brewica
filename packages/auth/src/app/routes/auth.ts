import express from 'express';
import { signUpPost } from '../controllers/signUp';
import { signInPost } from '../controllers/signIn';
import { refreshToken } from '../controllers/refreshToken';
import { signOut } from '../controllers/signOut';
import { verifyAccessToken } from '../middleware/verifyAccessToken';
import { user, exists } from '../controllers/user'

const authRouter: express.Router = express.Router();

authRouter.post("/auth/signup", signUpPost);
authRouter.post("/auth/signin", signInPost);
authRouter.get("/auth/token", refreshToken);
authRouter.get("/auth/signout", signOut);
authRouter.get("/auth/user", verifyAccessToken, user);
authRouter.get("/auth/user/exists", exists);

export default authRouter;