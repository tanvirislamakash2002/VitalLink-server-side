import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllDoctors = catchAsync(
    async (req: Request, res: Response) => {

        const result = await DoctorService.getAllDoctors()

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctors fetched successfully",
            data: result
        })
    }
)

const getDoctorById = catchAsync(
    async (req: Request, res: Response) => {
        const result = await DoctorService.getDoctorById(req.params.id as string)

        if (!result) {
            sendResponse(res, {
                httpStatusCode: status.NOT_FOUND,
                success: false,
                message: "Doctor not found"
            })
            return
        }

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor fetched successfully",
            data: result
        })
    }
)

const updateDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const result = await DoctorService.updateDoctor(req.params.id as string, req.body)

        if (!result) {
            sendResponse(res, {
                httpStatusCode: status.NOT_FOUND,
                success: false,
                message: "Doctor not found"
            })
            return
        }

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor updated successfully",
            data: result
        })
    }
)

const deleteDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const result = await DoctorService.deleteDoctor(req.params.id as string)

        if (!result) {
            sendResponse(res, {
                httpStatusCode: status.NOT_FOUND,
                success: false,
                message: "Doctor not found"
            })
            return
        }

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor deleted successfully",
            data: result
        })
    }
)

export const DoctorController = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
}