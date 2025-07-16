import { Request, Response } from "express";
import { User } from "../model/user.model.js";
import jwt from 'jsonwebtoken'
import { TryCatch } from "../utils/tryCatch.js";
import { AuthenticationReq } from "../middleware/isAuth.js";
import { getBuffer } from "../utils/getBuffer.js";
import cloudinary from "../utils/cloudinary.js"; 
import { oauth2client } from "../utils/googleConfig.js";
import axios from "axios";

// * User Login -------------------------------------------------------------------------------------------------------------------------------
export const login = async(req:Request, res:Response)=>{
    try {
        const { code } = req.body;
        if(!code){
            res.status(404).json({success:false, message:"Authorization code is required"});
            return;
        }

        const googleRes = await oauth2client.getToken(code);
        oauth2client.setCredentials(googleRes.tokens)
        const access_token = googleRes.tokens.access_token
        const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`);

        const {name, email, picture} = userRes.data;

        let user = await User.findOne({email})

        if(!user){
            user = await User.create({name, email, image:picture})
        }

        const token = jwt.sign({user}, process.env.JWT as string, {expiresIn:"7d"})
        res.status(200).json({success:true, message:"login success", token, user})
        
    } catch (error:any) {
        console.log(`❌ Login controller server error:: ${error}`)
        res.status(500).json({success:false, error:error.message, message:"internal server error"})
    }
}


// * Get My Profile -------------------------------------------------------------------------------------------------------------------------------
export const myProfile = TryCatch( async(req:AuthenticationReq, res)=>{
    const user = req.user;
    res.status(200).json({success:true, user})
})

// * Get User Profile -------------------------------------------------------------------------------------------------------------------------------
export const getUserProfile = TryCatch( async(req, res)=>{
    const user = await User.findById(req.params.id).select("- password");

    if(!user){
        res.status(404).json({success:false, message:"user not found"})
        return;
    }
    res.status(200).json({success:true, user})
})

// * Update User Profile -------------------------------------------------------------------------------------------------------------------------------
export const updateProfile = TryCatch(async(req:AuthenticationReq, res)=>{
    const {name, instagram, facebook, linkedIn, github, bio} = req.body;
    const userId = req.user?._id

    const user = await User.findByIdAndUpdate(userId, {name, instagram, facebook, linkedIn, github, bio},
        {new: true}
    )

    // in auth middleware donot fetch user data from DB because we save it in token, 
    // to reduce load on DB, so Here we need to update token with updated user infomation

    const token = jwt.sign({user}, process.env.JWT as string, {expiresIn:"7d"})
    res.status(200).json({success:true, message:"profile updated successfully 🎉", token, user})
})

// * Update User Profile Image ------------------------------------------------------------------------------------------------------------------
export const updateUserImage = TryCatch( async (req:AuthenticationReq, res)=> {
    const image = req.file;

    if(!image){
        res.status(404).json({success:false, message:"file not found."});
        return ;
    }

    const buffer = getBuffer(image);

    if(!buffer || !buffer.content){
        res.status(400).json({success:false, message:"Failed to generate buffer kindly try again or contact us."});
        return ;
    }

    const cloud = await cloudinary.uploader.upload(buffer.content, { folder:"blogs"})

    const user = await User.findByIdAndUpdate(req.user?._id, {
        image: cloud.secure_url
    }, { new: true })

    const token = jwt.sign({user}, process.env.JWT as string, {expiresIn:"7d"})
    res.status(200).json({success:true, message:"profile image updated successfully 🎉", token, user})
})
