import { Router } from "express";
import { getUserProfile, login, myProfile, updateProfile, updateUserImage } from "../controllers/user.controller.js";
import { isAuth } from "../middleware/isAuth.js"; 
import { upload } from "../middleware/multer.js";


const router = Router();

router.post('/login', login);
router.get('/me', isAuth, myProfile);
router.get('/user/:id', getUserProfile);
router.post('/user/update/profile', isAuth, updateProfile);
router.post('/user/update/image', isAuth, upload, updateUserImage)




export default router;