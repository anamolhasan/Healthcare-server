export interface ICreateReviewPayload {
    appointmentId: string;
    ration:number;
    comment: string;
}

export interface IUpdateReviewPayload {
    rating: number;
    comment: string;
}