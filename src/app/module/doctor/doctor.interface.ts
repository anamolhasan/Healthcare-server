import { Gender } from "../../../generated/prisma/enums";


export interface IUpdateDoctorSpecialtyPayload {
  specialtyId: string;
  shouldDelete?: boolean;
}


export interface IUpdateDoctorPayload {
    doctor?:{
        name:string;
        profilePhoto?:string;
        contentNumber?:string;
        address?:string;
        experience?:string;
        registrationNumber?:string;
        gender?:Gender;
        appointmentFee?:number;
        qualification?:string;
        currentWorkingPlace?:string;
        designation?:string;
    },
    specialties?:IUpdateDoctorPayload[]
}