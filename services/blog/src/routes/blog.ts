import { Router } from "express";
import { deleteBlogById, getAllBlogs, getBlogById } from "../controllers/blog.controller.js";



const router = Router();

router.get('/blogs/all', getAllBlogs);
router.get('/blog/:id', getBlogById)
router.delete('/blog/delete/:id', deleteBlogById)


export default router;
