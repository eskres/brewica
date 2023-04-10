import type { Request, Response, NextFunction } from "express";

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    // do something
    next();
}