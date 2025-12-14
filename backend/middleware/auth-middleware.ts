import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.headers.authorization?.split(" ")[1]

    if (!authToken) {
        res.status(401).json({
            message: "Unauthorized",
            success: false
        })
        return
    }

    try {
        const data = jwt.verify(authToken, process.env.JWT_SECRET!)
        console.log(data,"data from middleware");
        req.userId = (data as JwtPayload).userId
        next()
    } catch (error) {
        res.status(401).json({
            message: "Unauthorized",
            success: false
        })
    }
}