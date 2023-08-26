import { Router} from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

//================================================================================================
//REST API (HTTP CRUD operations) using express, the syntax is like this: app.METHOD(PATH, HANDLER)

// create user
router.post('/', async (req, res) => {
    const { email, name, username } = req.body;

    try {
        const result = await prisma.user.create({
            data: {
                email,
                name,
                username,
                bio: "Empty",
            },
        });
        res.json(result);

    } catch (error) {
        res.status(400).json({error: 'Username and email should be unique!'});
        
    }
});

//list user
router.get('/',async (req, res) => {
    const allUser = await prisma.user.findMany();
    res.json(allUser);
});

//get one user
router.get('/:id', async (req, res) => {
    const {id} = req.params;
    const user = await prisma.user.findUnique({where: {id: Number(id)}});
    if (!user) {
        return res.status(404).json({error: "User not found!"});
        }
    res.json(user);
});

//update user
router.put('/:id', async (req, res) => {
    const {id} = req.params;
    // if any of the following is null, then our database remains unchanged on that field!
    const {bio, name, image} = req.body;

    try {
        const result = await prisma.user.update({
            where: {id: Number(id)},
            data: {bio, name, image}
        })
        res.json(result);
    } catch(error) {
        res.status(400).json({ error: 'Cannot update the user!'});
    }
});

//delete user
router.delete('/:id', async (req, res) => {
    const {id} = req.params;
    await prisma.user.delete({where: {id: Number(id)}});
    res.sendStatus(200);
});
//================================================================================================

export default router;