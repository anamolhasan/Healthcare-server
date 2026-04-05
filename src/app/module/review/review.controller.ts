import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ReviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import  httpStatus  from "http-status";


const giveReview = catchAsync(async (req:Request, res:Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await ReviewService.giveReview(user, payload);

    sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success:true,
        message:'Review created successfully',
        data:result
    })
})

const getAllReviews = catchAsync (
    async (req:Request, res:Response) => {
        const result = await ReviewService.getAllReviews()

        sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success:true,
        message:'Review retrieval successfully',
        data:result
    })
    }
)

const myReviews = catchAsync(
    async (req:Request, res:Response) =>{
        const user = req.user;
        const result = await ReviewService.myReviews(user);

        sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success:true,
        message:'Review Retrieval successfully',
        data:result
    })
    }
)

const updateReview = catchAsync(
    async (req:Request, res:Response) => {
        const user = req.user;
        const reviewId = req.params.id 
        const payload = req.body;

        const result  = await ReviewService.updateReview(user, reviewId as string, payload);

        sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success:true,
        message:'Review update successfully',
        data:result
    })
    }
)

const deleteReview = catchAsync(
    async (req:Request,res:Response) => {
        const user = req.user;
        const reviewId = req.params.id 
        const result = ReviewService.deleteReview(user, reviewId as string);

        sendResponse(res, {
        httpStatusCode: httpStatus.OK,
        success:true,
        message:'Review delete successfully',
        data:result
    })
    }
)

export const ReviewController = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview
}