import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

const giveReview = async (user : IRequestUser, payload : ICreateReviewPayload) => {
};

const getAllReviews = async (
) => {
};

const myReviews = async (user: IRequestUser) => {
};

const updateReview = async (user: IRequestUser, reviewId: string, payload: IUpdateReviewPayload) => {
}

const deleteReview = async (user: IRequestUser, reviewId: string) => {
}


export const ReviewService = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview
}