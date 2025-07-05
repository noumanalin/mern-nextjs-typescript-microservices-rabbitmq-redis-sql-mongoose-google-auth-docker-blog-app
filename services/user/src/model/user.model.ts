import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    image: string;
    instagram: string;
    facebook: string;
    linkedIn: string;
    github: string;
    bio: string;
}


const userSchema:Schema<IUser> = new Schema ({
    name: { type:String, required:true },
    email: { type:String, unique:true, required:true },
    image: { type:String, required:true },
    instagram: String,
    facebook: String,
    linkedIn: String,
    github: String,
    bio: String
}, {timestamps: true})

export const User = mongoose.model<IUser>("User", userSchema)