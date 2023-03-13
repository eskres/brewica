import express from 'express';
import * as authCntrl from '../controllers/auth';

const authRouter: express.Router = express.Router();

authRouter.post("/auth/signup", authCntrl.signupPost);
// router.post("/auth/signin", authCntrl.auth_signin_post);
// router.get("/auth/user", authCntrl.auth_show_get);

export default authRouter;