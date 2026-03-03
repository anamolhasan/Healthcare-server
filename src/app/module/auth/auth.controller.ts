import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
// import ms, { StringValue } from "ms";
// import { envVars } from "../../config/env";
import { tokenUtils } from "../../utils/token";
import status from "http-status";


const registerPatient = catchAsync(
    async (req:Request, res:Response) => {
        // const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue);
        const payload = req.body;

    //    console.log(payload)

    const result = await AuthService.registerPatient(payload)

    const {accessToken, refreshToken, token, ...rest} = result
    
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBatterAuthSessionCookie(res, token as string)

    sendResponse(res,{
        httpStatusCode:status.CREATED,
        success:true,
        message:'Patient registered successfully',
        data:{
            token, 
            accessToken,
            refreshToken,
            ...rest,
        }
    })
    }
)


const loginUser = catchAsync(
    async (req:Request, res:Response) => {
       const payload = req.body;
       const result = await AuthService.loginUser(payload);

       const {accessToken, refreshToken, token, ...rest} = result 

       tokenUtils.setAccessTokenCookie(res, accessToken);
       tokenUtils.setRefreshTokenCookie(res, refreshToken);
       tokenUtils.setBatterAuthSessionCookie(res, token);
       sendResponse(res, {
        httpStatusCode:status.OK,
        success:true,
        message:'User logged in successfully',
        data:{
            token,
            accessToken,
            refreshToken,
            ...rest,
        },
       })
    }
)

export const authController = {
    registerPatient,
    loginUser,
}