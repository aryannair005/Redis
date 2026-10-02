import express from "express"
import dotenv, { parse } from "dotenv"
import { connectDB } from "./config/db.config.js"
import Redis from "ioredis"


dotenv.config()

const PORT = process.env.PORT || 8000


const app = express()

app.use(express.json())


// Redis Instance
const redis = new Redis(process.env.REDIS_URL)



// Send Otp
app.post("/send-otp",async(req,res)=>{
    const {email} = req.body;

    const otp = Math.floor(100000+Math.random()*900000).toString()

    await redis.set(`otp:${email}`,otp,"EX",60)

    return res.json({otp})
})

// Verify Otp
app.post("/verify-otp",async(req,res)=>{
    const {email,otp} =  req.body;

    const catchedOtp = await redis.get(`otp:${email}`)

    if(!catchedOtp){
        return res.status(400).json({message:"Otp expired or not available"})
    }

    if(otp != catchedOtp){
        return res.status(400).json({message:"Invalid Otp"})
    }

    await redis.del(`otp:${email}`)

    return res.json({message:"Otp verified"});
})

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




