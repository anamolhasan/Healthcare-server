import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { PrescriptionService } from "./prescription.service";
import { sendResponse } from "../../shared/sendResponse";
import httpStatus from 'http-status'


const givePrescription = catchAsync(
    async (req:Request, res:Response) => {
        const payload = req.body;
        const user = req.user;
        const result = await PrescriptionService.givePrescription(user, payload);

        sendResponse(res, {
            httpStatusCode: httpStatus.OK,
            success:true,
            message:'Prescription created successfully',
            data: result,
        })
    }
)

const myPrescriptions = catchAsync(
    async (req:Request, res:Response) => {
        const user = req.user;
        const result = await PrescriptionService.myPrescriptions(user);

         sendResponse(res, {
            httpStatusCode: httpStatus.OK,
            success:true,
            message:'Prescription fetched successfully',
            data: result,
        })
    }
)

const getAllPrescriptions = catchAsync(
    async (req:Request, res:Response) => {
        const result = await PrescriptionService.getAllPrescriptions();

         sendResponse(res, {
            httpStatusCode: httpStatus.OK,
            success:true,
            message:'Prescription retrieval successfully',
            data: result,
        })
    }
)


const updatePrescription = catchAsync(
    async (req:Request, res:Response) => {
        const user = req.user;
        const prescriptionId = req.params.id 
        const payload = req.body;
        const result = await PrescriptionService.updatePrescription(user, prescriptionId as string, payload);

         sendResponse(res, {
            httpStatusCode: httpStatus.OK,
            success:true,
            message:'Prescription update successfully',
            data: result,
        })
    }
)

const deletePrescription = catchAsync(
    async (req:Request, res:Response) => {
        const user = req.user;
        const prescriptionId = req.params.id 
        const result = await PrescriptionService.deletePrescription(user, prescriptionId as string)

         sendResponse(res, {
            httpStatusCode: httpStatus.OK,
            success:true,
            message:'Prescription delete successfully',
            data: result,
        })
    }
)

export const PrescriptionController = {
    givePrescription,
    myPrescriptions,
    getAllPrescriptions,
    updatePrescription,
    deletePrescription
}