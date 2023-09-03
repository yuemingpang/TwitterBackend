"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailService_1 = require("../services/emailService");
const EAMIL_TOKEN_EXP_MIN = 10;
const JWT_TOKEN_EXP_HOURS = 24;
const JWT_SECRET = process.env.JWT_SECRET || " ";
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
//generate random 8-digits token
function generateEmailToken() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}
//generate JWT API token
function generateAPIToken(tokenId) {
    const jwtPayload = { tokenId };
    return jsonwebtoken_1.default.sign(jwtPayload, JWT_SECRET, {
        algorithm: "HS256", noTimestamp: true,
    });
}
//create user if it not in database, then generate emailToken and sent to user email
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const emailToken = generateEmailToken();
    const expiration = new Date(new Date().getTime() + EAMIL_TOKEN_EXP_MIN * 60 * 1000);
    try {
        const createdToken = yield prisma.token.create({
            data: {
                type: 'EMAIL',
                emailToken,
                expiration,
                user: {
                    connectOrCreate: {
                        where: { email },
                        create: { email }, // if not found, then create a new user using this email
                    },
                },
            },
        });
        console.log(createdToken);
        //send emailToken to user email
        yield (0, emailService_1.sendEmailToken)(email, emailToken);
        res.sendStatus(200);
    }
    catch (e) {
        console.log(e);
        res.sendStatus(400).json({ error: "Failed to generate authentication token, please try again." });
    }
}));
//validate the emailToken and generate long-lived JWT API token
router.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, emailToken } = req.body;
    console.log(email, emailToken);
    //find the token in our database using the request emailToken 
    const targetToken = yield prisma.token.findUnique({
        where: { emailToken },
        include: {
            user: true
        }
    });
    // validations steps:
    if (!targetToken || !targetToken.vaild) {
        return res.sendStatus(401); // 401 unauthorized if not found or not valid.
    }
    if (targetToken.expiration < new Date()) {
        return res.status(401).json({ error: "Your token is expired." }); // token expired.
    }
    if (((_a = targetToken === null || targetToken === void 0 ? void 0 : targetToken.user) === null || _a === void 0 ? void 0 : _a.email) != email) {
        return res.sendStatus(401); // if someone by chance input a token of another user!
    }
    // Here the user is validated and we need to generate API token:
    const expiration = new Date(new Date().getTime() + JWT_TOKEN_EXP_HOURS * 60 * 60 * 1000);
    const apiToken = yield prisma.token.create({
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
    yield prisma.token.update({
        where: { id: targetToken.id },
        data: { vaild: false },
    });
    //Generate JWT token and send the encoded token id to user. 
    //In the future user only use the encoded token id for authentication. 
    //users don't need to know the actual token. We can match the API token with its id in databse!
    const authToken = generateAPIToken(apiToken.id);
    res.json(authToken);
}));
exports.default = router;
