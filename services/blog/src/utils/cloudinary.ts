import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv'
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    
})

export default cloudinary;

// cloudinary: for cloud storage
// datauri: for making buffer for cloudinary becuase cloudinary requires buffer[byte array] to store file
// multer: for file receving