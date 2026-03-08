import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
// import ms, { StringValue } from "ms";
// import { envVars } from "../../config/env";
import { tokenUtils } from "../../utils/token";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";


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

const getMe = catchAsync(
    async (req:Request, res:Response) => {
        const user = req.user;
        
        const result = await AuthService.getMe(user)

        sendResponse(res, {
            httpStatusCode:status.OK,
            success:true,
            message:'User profile fetched successfully',
            data: result
        })
    }
)

const getNewToken = catchAsync(
    async (req:Request, res:Response) => {
        const refreshToken = req.cookies.refreshToken 
        const betterAuthSessionToken = req.cookies['better-auth.session_token'];
        if(!refreshToken){
            throw new AppError(status.UNAUTHORIZED, 'Refresh token is messing');
        }
        const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

        const {accessToken, refreshToken: newRefreshToken, sessionToken} = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
        tokenUtils.setBatterAuthSessionCookie(res, sessionToken);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message:'New tokens generated successfully',
            data: {
                accessToken,
                refreshToken:newRefreshToken,
                sessionToken,
            }
        })
    }
)

export const authController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
}