import { Router } from "express";
import { isAuth } from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import { createBlog, deleteBlog, updateBlog } from "../controllers/blog.controller.js";



const router = Router();

router.post('/blog/new', isAuth, upload, createBlog)
router.patch('/:id', isAuth, upload, updateBlog);// Update blog - PATCH (for partial updates)
router.delete('/:id', isAuth, deleteBlog);

export default router;
