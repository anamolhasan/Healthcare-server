/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer'
import { envVars } from '../config/env'
import AppError from '../errorHelpers/AppError';
import status from 'http-status';
import path from 'path';


const transporter = nodemailer.createTransport({
    host:envVars.EMAIL_SENDER.SMTP_HOST,
    secure:true,
    auth:{
        user:envVars.EMAIL_SENDER.SMTP_USER,
        pass:envVars.EMAIL_SENDER.SMTP_PASS
    },
    port:Number(envVars.EMAIL_SENDER.SMTP_PORT)
})

interface SendEmailOptions {
    to:string;
    subject:string;
    templateName:string;
    templateData: Record<string, any>,
    attachments?:{
        filename:string;
        content:Buffer | string;
        contentType:string;
    }[]
}

export const sendEmail = async ({subject, templateData, templateName, to, attachments} : SendEmailOptions) => {
    try {
        const templatePath = path
    } catch (error: any) {
        console.log('Email sending Error', error.message);
        throw new AppError(status.INTERNAL_SERVER_ERROR, 'Failed to send email')
    }
}