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
      res.status(404).json({success:false, message:"Blog not found"})
      return;
    }

    if(blog[0].author != req.user?._id){
      res.status(403).json({success:false, message:"Unauthorized to update this blog"})
      return; 
    }

    let imageUrl = blog[0].image;
    let publicId: string | null = null;

    // Extract public_id from Cloudinary URL if exists
    if (imageUrl) {
      const urlParts = imageUrl.split('/');
      publicId = urlParts[urlParts.length - 1].split('.')[0];
      publicId = `blogs/${publicId}`; // Add folder prefix
    }

    // Handle image update if file is provided
    if(file) {
      const buffer = getBuffer(file);
      if (!buffer?.content) {
        res.status(400).json({ success: false, message: "Failed to generate file buffer" });
        return;
      }

      // Delete old image if exists
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new image
      const cloud = await cloudinary.uploader.upload(buffer.content, { folder: "blogs" });
      imageUrl = cloud.secure_url;
    }

    // Build the update object dynamically
    const updateData: any = {
      title: title !== undefined ? title : blog[0].title,
      description: description !== undefined ? description : blog[0].description,
      blogcontent: blogcontent !== undefined ? blogcontent : blog[0].blogcontent,
      category: category !== undefined ? category : blog[0].category,
      image: imageUrl
    };

    const updatedBlog = await sql`
      UPDATE blogs SET
        title = ${updateData.title},
        description = ${updateData.description},
        blogcontent = ${updateData.blogcontent},
        category = ${updateData.category},
        image = ${updateData.image}
      WHERE id = ${id}
      RETURNING *
    `;

    res.status(200).json({
      success: true,
      message: "🎉 Blog updated successfully",
      blog: updatedBlog[0]
    });

  } catch (error:any) {
    console.error(`❌ updateBlog server error:`, error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}) as RequestHandler;


// * Delete Blog ----------------------------------------------------------------------------------------------------------------------------
export const deleteBlog = (async (req:AuthenticationReq, res:Response)=>{
  try {
    const { id } = req.params;
    const authorId = req.user?._id;

    const blog = await sql`SELECT * FROM blogs WHERE id=${id}`;

    if(!blog.length){
      res.status(404).json({success:false, message:"Blog not found"});
      return;
    }

    if(blog[0].author != authorId){
      res.status(403).json({success:false, message:"Unauthorized to delete this blog"});
      return; 
    }

    // Delete associated image from Cloudinary if exists
    const imageUrl = blog[0].image;
    if (imageUrl) {
      const urlParts = imageUrl.split('/');
      const publicId = urlParts[urlParts.length - 1].split('.')[0];
      await cloudinary.uploader.destroy(`blogs/${publicId}`);
    }

    await sql`DELETE FROM saveblogs WHERE blogid = ${id}`;
    await sql`DELETE FROM comments WHERE blogid = ${id}`;
    await sql`DELETE FROM blogs WHERE id = ${id}`;

    res.status(200).json({
      success: true, 
      message: "Blog deleted successfully!", 
      blogId: blog[0].id
    });

  } catch (error:any) {
    console.error(`❌ deleteBlog server error:`, error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
}) as RequestHandler;