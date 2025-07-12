import { Request, Response } from "express";
import { sql } from "../utils/db.js";
import { redisClient } from "../server.js";
import cloudinary from "../utils/cloudinary.js";
import axios from 'axios';

// 1. ------------------------------------------------------------------------------------------------------------------------------------------------
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const { searchQuery="", category="" } = req.query as { searchQuery?: string; category?: string };

    const cacheKey = `blogs:${searchQuery}:${category}`;
    const cachedBlogs = await redisClient.get(cacheKey)
    if(cachedBlogs){
      res.status(200).json({success:true, blogs:JSON.parse(cachedBlogs), isRedisCached:true});
      return;
    }

    let blogs;

    if (searchQuery && category) {
      blogs = await sql`
        SELECT * FROM blogs
        WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})
        AND category = ${category}
        ORDER BY created_at DESC
      `;
    } else if (searchQuery) {
      blogs = await sql`
        SELECT * FROM blogs
        WHERE (title ILIKE ${"%" + searchQuery + "%"} OR description ILIKE ${"%" + searchQuery + "%"})
        ORDER BY created_at DESC
      `;
    } else if (category) {
      blogs = await sql`
        SELECT * FROM blogs
        WHERE category = ${category}
        ORDER BY created_at DESC
      `;
    } else {
      blogs = await sql`SELECT * FROM blogs ORDER BY created_at DESC`;
    }

    await redisClient.set(cacheKey, JSON.stringify(blogs), { EX:3600 });
    res.status(200).json({ success: true, blogs, isRedisCached:false });
  } catch (error: any) {
    console.error("❌ getAllBlogs error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};



// 2. ------------------------------------------------------------------------------------------------------------------------------------------------
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cacheKey = `blog:${id}`;
    const cachedBlog = await redisClient.get(cacheKey);
    if (cachedBlog) {
      const parsedData = JSON.parse(cachedBlog);
      return res.status(200).json({ success: true, blog: parsedData.blog, author: parsedData.author, isRedisCached: true });
    }

    const blog = await sql`SELECT * FROM blogs WHERE id = ${id}`;
    if (blog.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found with this id!" });
    }

    const authorId = blog[0].author;

    // Get author info from USER_SERVICE
    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/user/${authorId}`);

    await redisClient.set(cacheKey, JSON.stringify({ blog: blog[0], author: data.user }), { EX: 3600 });

    return res.status(200).json({ success: true, blog: blog[0], author: data.user, isRedisCached: false });

  } catch (error: any) {
    console.error("❌ getBlogById error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


// 3. ------------------------------------------------------------------------------------------------------------------------------------------------
export const deleteBlogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const blogResult = await sql`SELECT * FROM blogs WHERE id = ${id}`;
    if (blogResult.length === 0) {
      return res.status(404).json({ success: false, message: "Blog not found with this id!" });
    }

    const blog = blogResult[0];

    // Delete blog and associated comments, saved blogs
    await sql`DELETE FROM comments WHERE blogid = ${id}`;
    await sql`DELETE FROM saveblogs WHERE blogid = ${id}`;
    await sql`DELETE FROM blogs WHERE id = ${id}`;

    // Delete from Redis cache
    const cacheKey = `blog:${id}`;
    await redisClient.del(cacheKey);

    // Delete image from Cloudinary
    let publicId: string | null = null;
    try {
      const urlParts = blog.image.split('/');
      const fileName = urlParts[urlParts.length - 1]; // Extract last part
      publicId = `blogs/${fileName.split('.')[0]}`;   // Remove extension
    } catch (parseError) {
      console.error("❌ Error parsing image URL for deleting image from Cloudinary:", parseError);
    }

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`✅ Successfully deleted image from Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary deletion error:", cloudinaryError);
        // Continue execution even if image deletion fails
      }
    }

    return res.status(200).json({ success: true, message: "Blog and related data deleted successfully" });

  } catch (error: any) {
    console.error("❌ deleteBlogById error:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
