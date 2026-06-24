import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
// import ms, { StringValue } from "ms";
// import { envVars } from "../../config/env";
import { tokenUtils } from "../../utils/token";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { CookieUtils } from "../../utils/cookie";
import { envVars } from "../../config/env";
import { auth } from "../../lib/auth";


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
        // console.log(req.cookies)
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


const changePassword = catchAsync (
    async (req:Request, res:Response) => {
        const payload = req.body;
        const betterAuthSessionToken = req.cookies['better-auth.session_token'];

        const result = await AuthService.changePassword(payload, betterAuthSessionToken);

        const {accessToken, refreshToken, token} = result;

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        tokenUtils.setBatterAuthSessionCookie(res, token as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: 'Password changed successfully',
            data: result,
        })
    }
)

const logOutUser = catchAsync (
    async (req:Request, res:Response) => {
        const betterAuthSessionToken = req.cookies['better-auth.session_token'];
        const result = await AuthService.logOutUser(betterAuthSessionToken)
        
        CookieUtils.clearCooke(res, 'accessToken', {
            httpOnly: true, 
            secure: true,
            sameSite:'none'
        });
        CookieUtils.clearCooke(res, 'refreshToken', {
            httpOnly: true, 
            secure: true,
            sameSite:'none'
        });
        CookieUtils.clearCooke(res, 'better-auth.session_token', {
            httpOnly: true, 
            secure: true,
            sameSite:'none'
        });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success:true,
            message:'User Logged out successfully',
            data: result
        })
    }
)

const verifyEmail = catchAsync(
    async (req:Request, res:Response) => {

        const {email, otp} = req.body
        await AuthService.verifyEmail(email, otp)
        
        sendResponse(res, {
            httpStatusCode:status.OK,
            success:true,
            message: 'Email verified successfully'
        })
    }
)

const forgetPassword = catchAsync(
    async (req:Request, res:Response) => {

        const {email} = req.body
        await AuthService.forgetPassword(email)
        
        sendResponse(res, {
            httpStatusCode:status.OK,
            success:true,
            message: 'Password reset OTP send to email successfully'
        })
    }
)

const resetPassword = catchAsync(
    async (req:Request, res:Response) => {

        const {email, otp, newPassword} = req.body;
        await AuthService.resetPassword(email, otp, newPassword)
        
        sendResponse(res, {
            httpStatusCode:status.OK,
            success:true,
            message: 'Password reset successfully'
        })
    }
)

// /api/v1/auth/login/google?redirect=/profile
const googleLogin = catchAsync(
    async (req:Request, res:Response) => {

        
        sendResponse(res, {
            httpStatusCode:status.OK,
            success:true,
            message: 'Email verified successfully'
        })
    }
)

const googleLoginSuccess = catchAsync(
    async (req:Request, res:Response) => {
        const redirectPath = req.query.redirect as string || '/dashboard';

        const sessionToken = req.cookies['better-auth.session_token'];

        if(!sessionToken){
            return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
        }

        const session = await auth.api.getSession({
            headers:{
                "Cookie":`better-auth.session_token=${sessionToken}`
            }
        })

        if(!session){
            return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
        }

        if(session && !session.user){
            return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
        }

        const result = await AuthService.googleLoginSuccess(session);

        const {accessToken, refreshToken} = result

        tokenUtils.setAccessTokenCookie(res, accessToken);
        tokenUtils.setRefreshTokenCookie(res, refreshToken);
        // ?redirect=//profile -> /profile
        const isValidRedirectPath = redirectPath.startsWith('/') && !redirectPath.startsWith('//');
        const finalRedirectPath = isValidRedirectPath ? redirectPath : '/dashboard';

        res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
    }
)

const handleOAuthError = catchAsync((req:Request, res:Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`)
})

export const authController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logOutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    handleOAuthError,
}