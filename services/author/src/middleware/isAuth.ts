import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    image: string;
    instagram: string;
    facebook: string;
    linkedIn: string;
    github: string;
    bio: string;
}


export interface AuthenticationReq extends Request {
    user?: IUser | null;
}

export const isAuth = async (req:AuthenticationReq, res:Response, next:NextFunction):Promise<void>=> {
    try {
        const authHeader = req.headers.authorization

        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({message:"Please Login first"});
            return;
        }

        const token = authHeader.split(" ")[1];
        const decodeToken = jwt.verify(token, process.env.JWT as string) as JwtPayload;

        if(!decodeToken || !decodeToken.user){
            res.status(401).json({message:"invalid or expire token", success:false})
            return;
        }

        req.user = decodeToken.user;
        next();
    } catch (error) {
        console.log(`❌ isAuth middleware JWT verification error: ${error}`)
        res.status(401).json({success:false, message:"Pleas Login first"})
    }
}