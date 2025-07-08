import { NextFunction, Request, RequestHandler, Response } from "express";


export const TryCatch = (handler:RequestHandler) : RequestHandler => {
    return async(req:Request, res:Response, next:NextFunction)=>{
        try {
            await handler(req, res, next)
        } catch (error:any) {
            console.log(`❌ Internal server error:: ${error}`)
            res.status(500).json({success:false, message:"internal server error", errMessage:error.message})
        }
    }
}