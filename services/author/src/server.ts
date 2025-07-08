import express , { Application, Response, Request } from "express";
import "dotenv/config"; 
import { initDB } from "./model/init_models_db.js";
import blogRoutes from './routes/blog.routes.js'



const app:Application = express()

const PORT = process.env.PORT || 3001



app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({success:true, message:"Auther service is running!"});
});

app.use('/api', blogRoutes);

initDB().then(()=>{
  app.listen(PORT, ()=>{console.log(`🚀 Server is running on http://localhost:${PORT} with ${process.pid}`)})
});
