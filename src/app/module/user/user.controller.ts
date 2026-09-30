import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UserService } from "./user.service";
import status from "http-status";

const createDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        if (req.file?.path && payload.doctor) {
            payload.doctor.profilePhoto = req.file.path;
        }

        const result = await UserService.createDoctor(payload)

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Doctor registered successfully",
            data: result
        })
    }
)

export const UserController = {
    createDoctor,
}