"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const tweetRoutes_1 = __importDefault(require("./routes/tweetRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/user', authMiddleware_1.authenticateToken, userRoutes_1.default); //route to the auth middleware first and then to userRoute
app.use('/tweet', authMiddleware_1.authenticateToken, tweetRoutes_1.default); //route to the auth middleware first and then to tweetRoute
app.use('/auth', authRoutes_1.default);
// Here the path = '/' this means the root page of the server site.
app.get('/', (req, res) => {
    res.send('This is the TwitterBackend Server!');
});
app.listen(3000, () => {
    console.log("Server is ready!");
});
