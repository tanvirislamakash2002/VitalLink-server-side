import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

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
        throw new Error("Failed to register patient")
    }

    // todo : Create patient profile in transaction after sign up of patient in user model
    // const patient = await prisma.$transaction(async (tx)=>{
    //     await tx.patient
    // })

    return data
}

export const AuthService = {
    registerPatient,
}