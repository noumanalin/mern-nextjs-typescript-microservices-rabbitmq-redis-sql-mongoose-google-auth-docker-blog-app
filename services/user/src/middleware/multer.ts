import multer from "multer";

// multer.memoryStorage() for storing on cloud
// multer.diskStorage() for storing files on our server

const storage = multer.memoryStorage()

export const upload = multer({storage}).single('image')



// or use like this
// const upload = multer({
//     storage:multer.memoryStorage(),
// });