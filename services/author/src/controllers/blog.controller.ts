import { Response, RequestHandler } from "express";
import { AuthenticationReq } from "../middleware/isAuth.js";
import { getBuffer } from "../utils/getBuffer.js";
import cloudinary from "../utils/cloudinary.js";
import { sql } from "../utils/db.js";


// * Create Blog ----------------------------------------------------------------------------------------------------------------------------
export const createBlog = (async (req: AuthenticationReq, res: Response) => {
  try {
    const { title, description, blogcontent, category } = req.body;  // Fixed typos
    const file = req.file;

    if (!file) {
      res.status(404).json({ success: false, message: "blog file not found" });
      return;
    }

    const buffer = getBuffer(file);
    if (!buffer?.content) {
      res.status(400).json({ success: false, message: "failed to generate file buffer" });
      return;
    }

    const cloud = await cloudinary.uploader.upload(buffer.content, { folder: "blogs" });
    const blog = await sql`
      INSERT INTO blogs (title, description, image, blogcontent, category, author)
      VALUES (${title}, ${description}, ${cloud.secure_url}, ${blogcontent}, ${category}, ${req.user?._id})
      RETURNING *
    `;

    res.status(201).json({ success: true, message: "🎉 Blog created successfully", blog: blog[0] });
  } catch (error: any) {
    console.error(`❌ createBlog server error:`, error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}) as RequestHandler;


// * Update Blog ----------------------------------------------------------------------------------------------------------------------------
export const updateBlog = (async(req:AuthenticationReq, res:Response)=>{
  try {
    const {id} = req.params;
    const { title, description, blogcontent, category } = req.body;  
    const file = req.file;

    const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`

    if(!blog.length){
      res.status(404).json({success:false, message:"Blog not found?"})
      return;
    }

    if(blog[0].author != req.user?._id){
      res.status(400).json({success:false, message:"Please don't try to update other user blog"})
      return; 
    }

    if(file){ // remove previos image if user want to update image also
      const buffer = getBuffer(file);
      if (!buffer?.content) {
        res.status(400).json({ success: false, message: "failed to generate file buffer" });
        return;
      }

      const cloud = await cloudinary.uploader.upload(buffer.content, { folder: "blogs" });
    }


    const updatedBlog = await sql`UPDATE blogs SET
    title = ${}
    `
  } catch (error:any) {
    console.error(`❌ updateBlog server error:`, error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}) as RequestHandler;


// * Update Blog ----------------------------------------------------------------------------------------------------------------------------
export const deleteBlog = (async (req:AuthenticationReq, res:Response)=>{
  try {
    const { id } = req.params;
    const authorId = req.user?._id;

    const blog = await sql `SELECT title FROM blogs WHERE id=${id}`

    if(!blog){
      res.status(404).json({success:false, message:"blog not found"})
      return;
    }

    if(blog[0].author != authorId){
      res.status(400).json({success:false, message:"Please don't try to delete other users blog"})
      return; 
    }

    await sql`DELETE FROM saveblogs WHERE blogid = ${id}`;
    await sql`DELETE FROM comments WHERE blogid = ${id}`;
    await sql`DELETE FROM blogs WHERE id = ${id}`;

    res.status().json({success:true, message:"Blog Deleted!", blogId:blog[0].id})

  } catch (error:any) {
    console.error(`❌ deleteBlog server error:`, error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
})