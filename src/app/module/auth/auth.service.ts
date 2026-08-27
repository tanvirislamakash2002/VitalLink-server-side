import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}
const registerPatient = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            // default values set in the auth.ts
            // needPasswordChange: false,
            // role: "PATIENT"
        }
    })

    if (!data.user) {
        // throw new Error("Failed to register patient")
        throw new AppError(status.BAD_REQUEST, "Failed to register patient")
    }

    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientTx = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: data.user.name,
                    email: data.user.email
                }
            })

            return patientTx
        })

        return {
            ...data,
            patient
        }
    } catch (error) {
        console.log("Transaction  error: ", error)

        await prisma.user.delete({
            where: {
                id: data.user.id
            }
        })

        throw error;
    }
}

interface ILoginUserPayload {
    email: string;
    password: string;
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password
        }
    })
    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN,"User is blocked")
    }
    if (data.user.isDeleted || data.user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND,"User is deleted")
    }
    return data
}

export const AuthService = {
    registerPatient,
    loginUser
}