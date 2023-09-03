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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
//================================================================================================
//REST API (HTTP CRUD operations) using express, the syntax is like this: app.METHOD(PATH, HANDLER)
// create user
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, username } = req.body;
    try {
        const result = yield prisma.user.create({
            data: {
                email,
                name,
                username,
                bio: "Empty",
            },
        });
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: 'Username and email should be unique!' });
    }
}));
//list user
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const allUser = yield prisma.user.findMany();
    res.json(allUser);
}));
//get one user
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = yield prisma.user.findUnique({ where: { id: Number(id) }, include: { tweets: true } });
    if (!user) {
        return res.status(404).json({ error: "User not found!" });
    }
    res.json(user);
}));
//update user
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // if any of the following is null, then our database remains unchanged on that field!
    const { bio, name, image } = req.body;
    try {
        const result = yield prisma.user.update({
            where: { id: Number(id) },
            data: { bio, name, image }
        });
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: 'Cannot update the user!' });
    }
}));
//delete user
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield prisma.user.delete({ where: { id: Number(id) } });
    res.sendStatus(200);
}));
//================================================================================================
exports.default = router;
