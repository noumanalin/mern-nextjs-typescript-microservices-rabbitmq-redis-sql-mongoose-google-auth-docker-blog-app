import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () =>{
    try {
        mongoose.connect(process.env.MONGO_URI as string, {
            dbName: 'blog'
        });
        console.log(`🚀 Mongodb connected successfully.`)
    } catch (error) {
        console.log(`❌ Mongoose connection Error:: ${error}`)
    }
}