/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../utils/email";
import { ICreatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";

const givePrescription = async (user : IRequestUser, payload : ICreatePrescriptionPayload) => {
};

const myPrescriptions = async (user: IRequestUser) => {
};

const getAllPrescriptions = async () => {
    const result = await prisma.prescription.findMany({
        include: {
            patient: true,
            doctor: true,
            appointment: true,
        }
    })

    return result;
};

const updatePrescription = async (user: IRequestUser, prescriptionId: string, payload: any) => {
};

const deletePrescription = async (user: IRequestUser, prescriptionId: string): Promise<void> => {
}


export const PrescriptionService = {
    givePrescription,
    myPrescriptions,
    getAllPrescriptions,
    updatePrescription,
    deletePrescription
}