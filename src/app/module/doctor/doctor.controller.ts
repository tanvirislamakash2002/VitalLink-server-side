import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { DoctorService } from "./doctor.service";
import { DoctorServiceV1Raw } from "./doctor.service.v1-raw";

const getAllDoctors = catchAsync(
    async (req: Request, res: Response) => {
        const query = req.query;

        // const result = await DoctorService.getAllDoctors(query as IQueryParams);

        const result = await DoctorServiceV1Raw.getAllDoctors(query as IQueryParams)
        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctors fetched successfully",
            data: result.data,
            meta: result.meta,
        })
    }
)

const getAllPublicDoctors = catchAsync(
    async (req: Request, res: Response) => {
        const result = await DoctorService.getAllPublicDoctors(req.query as IQueryParams);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctors fetched successfully",
            data: result.data,
            meta: result.meta,
        })
    }
)

const getDoctorById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const doctor = await DoctorService.getDoctorById(id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor fetched successfully",
            data: doctor,
        })
    }
)

const getPublicDoctorById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const doctor = await DoctorService.getPublicDoctorById(id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor fetched successfully",
            data: doctor,
        })
    }
)

const getPublicDoctorSchedules = catchAsync(
    async (req: Request, res: Response) => {
        const schedules = await DoctorService.getPublicDoctorSchedules(req.params.id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Available doctor schedules fetched successfully",
            data: schedules,
        })
    }
)

const updateDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        if (req.file?.path) {
            payload.doctor = {
                ...(payload.doctor ?? {}),
                profilePhoto: req.file.path,
            };
        }

        const updatedDoctor = await DoctorService.updateDoctor(id as string, payload);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor updated successfully",
            data: updatedDoctor,
        })
    }
)

const deleteDoctor = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await DoctorService.deleteDoctor(id as string);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Doctor deleted successfully",
            data: result,
        })
    }
)

export const DoctorController = {
    getAllDoctors,
    getAllPublicDoctors,
    getDoctorById,
    getPublicDoctorById,
    getPublicDoctorSchedules,
    updateDoctor,
    deleteDoctor,
};