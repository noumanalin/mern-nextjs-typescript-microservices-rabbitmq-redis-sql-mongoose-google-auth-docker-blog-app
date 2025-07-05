import express , { Application, Response, Request } from "express";
import "dotenv/config"; 
import { connectDB } from "./utils/connectDB.js";
import userRoutes from './routes/user.routes.js'


const app:Application = express()

const PORT = process.env.PORT || 3001

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running!");
});


app.use("/api", userRoutes);

app.listen(PORT, ()=>{console.log(`🚀 Server is running on http://localhost:${PORT} with ${process.pid}`)})
