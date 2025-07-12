import express , { Application } from "express";
import "dotenv/config"; 

import { createClient } from 'redis'

import { initBlogDB } from "./model/init_models_db.js"; 
import blogRoutes from './routes/blog.js'; 

const app:Application = express()

const PORT = process.env.PORT || 3001

export const redisClient = createClient({url:process.env.REDIS_UPSTASH_URL});

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({success:true, message:"Blog service is running!"});
});


app.use('/api', blogRoutes)

const startServer = async () => {
  try {
    await initBlogDB();
    app.listen(PORT, () => {
      console.log(`🚀 Blog service running on ${PORT}`);
    });
    redisClient.connect()
    .then(()=>console.log(`🚀 Redis UpStash Cach DB connected successfully.`))
    .catch(()=>console.log(`❌ Redis connection error.`))
  } catch (error) {
    console.error('❌ Blog service failed to start:', error);
    process.exit(1);
  }
};

startServer();
