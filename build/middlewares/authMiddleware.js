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
exports.authenticateToken = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || " ";
const prisma = new client_1.PrismaClient();
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the encoded JWT token id here as token
        const authHeader = req.headers['authorization'];
        const JWTtoken = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
        if (!JWTtoken) {
            return res.sendStatus(401);
        }
        //decode the JWT token
        try {
            const jwtPayload = yield jsonwebtoken_1.default.verify(JWTtoken, JWT_SECRET);
            const targetToken = yield prisma.token.findUnique({
                where: { id: jwtPayload.tokenId },
                include: { user: true },
            });
            if (!(targetToken === null || targetToken === void 0 ? void 0 : targetToken.vaild) || targetToken.expiration < new Date()) {
                return res.status(401).json({ error: "API token is invalid or expired!" });
            }
            req.user = targetToken.user; //assign the req.user as the targetToken.user and pass to nextRoute
        }
        catch (e) {
            return res.sendStatus(401);
        }
        next();
    });
}
exports.authenticateToken = authenticateToken;
