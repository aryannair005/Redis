import express from "express"
import dotenv, { parse } from "dotenv"
import { connectDB } from "./config/db.config.js"
import User from "./models/user.model.js"
import Redis from "ioredis"
import sendEmail from "./config/sendEmail.config.js"
import emailQueue from "./queue.js"


dotenv.config()

const PORT = process.env.PORT || 8000


const app = express()

app.use(express.json())


// Redis Instance
const redis = new Redis(process.env.REDIS_URL)


connectDB()
    .then(() => {
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server is listening to PORT: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });



app.post("/create", async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const isUser = await User.findOne({ email });

        if (isUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = await User.create({ name, email });
        await redis.del("user:all")
        
        // Adding email job to queue
       await emailQueue.add("send-email",{email})

        return res.status(201).json({ user });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
});
