import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import { createBlog } from "../controllers/blog.controller.js";



const router = Router();

router.post('/blog/new', isAuth, upload, createBlog)

export default router;
