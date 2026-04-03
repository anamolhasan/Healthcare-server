import { name } from "ejs";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IUpdatePatientHealthDataPayload, IUpdatePatientProfilePayload } from "./patient.interface";
import { convertToDataTime } from "./patient.utils";



const updateMyProfile = async (user : IRequestUser, payload: IUpdatePatientProfilePayload) => {
    // throw new Error('This is an intentional error test Sentry integration in the backend.');
    const patientData = await prisma.patient.findUniqueOrThrow({
        where:{
            email:user.email
        },
        include:{
            patientHealthData:true,
            medicalReports:true,
        }
    });

    await prisma.$transaction(async (tx) => {
        if(payload.patientInfo){
            await tx.patient.update({
                where:{
                    id: patientData.id
                },
                data:{
                    ...payload.patientInfo
                }
            });

            if(payload.patientInfo.name || payload.patientInfo.profilePhoto){
                const userData = {
                    name: payload.patientInfo.name ? payload.patientInfo.name : patientData.name,
                    image: payload.patientInfo.profilePhoto ? payload.patientInfo.profilePhoto : patientData.profilePhoto, 
                }
                await tx.user.update({
                    where:{
                        id:patientData.userId
                    },
                    data:{
                        ...userData
                    }
                })
            }
        }

        if(payload.patientHealthData){
            const healthDataToSave: IUpdatePatientHealthDataPayload = {
                ...payload.patientHealthData
            }

            if(payload.patientHealthData.dateOfBirth){
                healthDataToSave.dateOfBirth = convertToDataTime(
                    typeof healthDataToSave.dateOfBirth === 'string' ? healthDataToSave.dateOfBirth : undefined
                ) as Date;
            }

            await tx.patientHealthData.upsert({
                where:{
                    patientId: patientData.id
                },
                update: healthDataToSave,
                create: {
                    patientId: patientData.id,
                    ...healthDataToSave
                }
            })
        }
    })
}