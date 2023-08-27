import express from "express";
import userRoutes from './routes/userRoutes';
import tweetRoutes from './routes/tweetRoutes';
import authRoutes from './routes/authRoutes';
import { authenticateToken } from "./middlewares/authMiddleware";

const app = express();
app.use(express.json());
app.use('/user', authenticateToken, userRoutes);//route to the auth middleware first and then to userRoute
app.use('/tweet', authenticateToken, tweetRoutes);//route to the auth middleware first and then to tweetRoute
app.use('/auth', authRoutes);

// Here the path = '/' this means the root page of the server site.
app.get('/', (req, res) => {
    res.send('This is the TwitterBackend Server!');
});


app.listen(3000, () => {
    console.log("Server is ready!");
});

