import { Request, Response, NextFunction } from "express";
import { PrismaClient, User} from "@prisma/client";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || " ";
const prisma = new PrismaClient();

type AuthRequest = Request & {user?: User};

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
    // get the encoded JWT token id here as token
    const authHeader = req.headers['authorization'];
    const JWTtoken = authHeader?.split(" ")[1];
    if (!JWTtoken) {
        return res.sendStatus(401);
    }
    //decode the JWT token
    try {
        const jwtPayload = await jwt.verify(JWTtoken, JWT_SECRET) as {tokenId: number};
        const targetToken = await prisma.token.findUnique({
            where: {id: jwtPayload.tokenId},
            include: {user: true},
        });
        if (!targetToken?.vaild || targetToken.expiration < new Date()) {
            return res.status(401).json({error: "API token is invalid or expired!"});
        }
        req.user = targetToken.user; //assign the req.user as the targetToken.user and pass to nextRoute
    } catch (e) {
        return res.sendStatus(401);
    }

    next();
}