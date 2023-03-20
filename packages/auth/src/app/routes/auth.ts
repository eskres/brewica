import express from 'express';
import * as authCntrl from '../controllers/auth';

const authRouter: express.Router = express.Router();

authRouter.post("/auth/signup", authCntrl.signUpPost);
authRouter.post("/auth/signin", authCntrl.signInPost);

export default authRouter;