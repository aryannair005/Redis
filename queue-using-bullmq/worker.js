import { Worker } from "bullmq";
import Redis from "ioredis"
import sendEmail from "./config/sendEmail.config.js";


const connection = new Redis("redis://localhost:6379",{
    maxRetriesPerRequest:null
})

const worker = new Worker("emailQueue",async(job)=>{

    console.log("Job started")
    const email = job.data.email
    await sendEmail(email)
    console.log("Job Ended");   
},{connection})