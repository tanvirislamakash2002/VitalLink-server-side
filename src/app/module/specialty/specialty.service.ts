import { Specialty } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createSpecialty = async (payload: Specialty): Promise<Specialty> => {
    const specialty = await prisma.specialty.create({
        data: payload
    })
    return specialty
}

const getAllSpecialties = async () => {

}
const deleteSpecialty = async (id:string) => {

}
export const SpecialtyService = {
    createSpecialty,
    getAllSpecialties,
    deleteSpecialty
}