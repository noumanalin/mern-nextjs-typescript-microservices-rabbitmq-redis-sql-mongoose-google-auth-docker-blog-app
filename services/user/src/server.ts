import express , { Application } from "express";
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors'
import { connectDB } from "./utils/connectDB.js";
import userRoutes from './routes/user.routes.js'


const app:Application = express()

const PORT = process.env.PORT || 3001
const FRONTEND_URL = process.env.FRONTEND_URL as string;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(cors({
    origin: ["http://localhost:3000", FRONTEND_URL, "https://localhost:5175"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.get("/", (req, res) => {
  res.send("Server is running!");
});


app.use("/api", userRoutes);

app.listen(PORT, ()=>{console.log(`🚀 Server is running on http://localhost:${PORT} with ${process.pid}`)})
