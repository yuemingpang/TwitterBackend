import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import { sendEmailToken } from "../services/emailService";

const EAMIL_TOKEN_EXP_MIN = 10;
const JWT_TOKEN_EXP_HOURS = 24;
const JWT_SECRET = process.env.JWT_SECRET || " ";

const router = Router();
const prisma = new PrismaClient();

//generate random 8-digits token
function generateEmailToken(): string{
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

//generate JWT API token
function generateAPIToken(tokenId: number): string {
    const jwtPayload = {tokenId};
    return jwt.sign(jwtPayload, JWT_SECRET, {
        algorithm: "HS256", noTimestamp: true,
    });
}

//create user if it not in database, then generate emailToken and sent to user email
router.post('/login', async (req, res) => {
    const {email} = req.body;

    const emailToken = generateEmailToken();
    const expiration = new Date(new Date().getTime() + EAMIL_TOKEN_EXP_MIN*60*1000);

    try {
        const createdToken = await prisma.token.create({
            data: {
                type: 'EMAIL',
                emailToken,
                expiration,
                user: {
                    connectOrCreate: {
                        where: {email}, // find the user with the email
                        create: {email}, // if not found, then create a new user using this email
                    },
                },
            },
        });
    
        console.log(createdToken);
        //send emailToken to user email
        await sendEmailToken(email, emailToken);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400).json({error: "Failed to generate authentication token, please try again."});
    }

});

//validate the emailToken and generate long-lived JWT API token
router.post('/authenticate', async (req, res) => {
    const {email, emailToken} = req.body;
    console.log(email, emailToken);

    //find the token in our database using the request emailToken 
    const targetToken = await prisma.token.findUnique({
        where: {emailToken},
        include: {
            user: true
        }
    });

    // validations steps:
    if (!targetToken || !targetToken.vaild) {
        return res.sendStatus(401); // 401 unauthorized if not found or not valid.
    }
    if (targetToken.expiration < new Date()) {
        return res.status(401).json({error: "Your token is expired."}); // token expired.
    }
    if (targetToken?.user?.email != email) {
        return res.sendStatus(401); // if someone by chance input a token of another user!
    }

    // Here the user is validated and we need to generate API token:
    const expiration = new Date(new Date().getTime() + JWT_TOKEN_EXP_HOURS*60*60*1000);
    const apiToken = await prisma.token.create({
        data: {
            type: "API",
            expiration,
            user: {
                connect: {
                    email,
                },
            },
        },
    });

    //Now we can invalidate the emailToken:
    await prisma.token.update({
        where: {id: targetToken.id},
        data: {vaild: false},
    });

    //Generate JWT token and send the encoded token id to user. 
    //In the future user only use the encoded token id for authentication. 
    //users don't need to know the actual token. We can match the API token with its id in databse!
    const authToken = generateAPIToken(apiToken.id);

    res.json(authToken);
});

export default router;