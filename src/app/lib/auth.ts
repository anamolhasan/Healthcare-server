import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../config/env";
import { bearer, emailOTP } from "better-auth/plugins";

export const auth = betterAuth({
    baseURL:envVars.BETTER_AUTH_URL,
    secret:envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword:{
        enabled:true,
        requireEmailVerification:true,
    },

    socialProviders:{
        google:{
            clientId:envVars.GOOGLE_CLIENT_ID,
            clientSecret:envVars.GOOGLE_CLIENT_SECRET,
             // callbackUrl: envVars.GOOGLE_CALLBACK_URL,
             mapProfileToUser:()=>{
                return {
                    role: Role.PATIENT,
                    status:UserStatus.ACTIVE,
                    needPasswordChange:false,
                    emailVerified:true,
                    isDeleted:false,
                    deletedAt:null,
                }
             }
        }
    },

    emailVerification:{
        sendOnSignUp:true,
        sendOnSignIn:true,
        autoSignInAfterVerification:true,
    },

    user:{
        additionalFields:{
            role:{
                type:'string',
                required:true,
                defaultValue:Role.PATIENT
            },
            
            status:{
                type:'string',
                required:true,
                defaultValue:UserStatus.ACTIVE
            },

            needPasswordChange:{
                type:'boolean',
                required:true,
                defaultValue:false
            },

            isDeleted:{
                type:'boolean',
                required:true,
                defaultValue:false
            },

            deletedAt:{
                type:'date',
                required:false,
                defaultValue:null
            }
        }
    },

    plugins:[
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification:true,
            async sendVerificationOTP({email, otp, type}){
                if(type === 'email-verification'){
                    const user = await prisma.user.findUnique({
                        where:{
                            email,
                        }
                    })

                    if(user && !user.emailVerified){
                        sendEmail 
                    }
                }
            }
        })
    ],

    session:{
        expiresIn: 60 * 60 * 60 * 24, // 1 Day in seconds
        updateAge: 60 * 60 * 60 * 24,  // 1 day in seconds
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
        } 
    }
});