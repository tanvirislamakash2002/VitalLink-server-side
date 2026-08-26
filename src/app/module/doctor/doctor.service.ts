import { prisma } from "../../lib/prisma"

const getAllDoctors = async () => {
    const doctors = await prisma.doctor.findMany({
        where: {
            isDeleted: false
        },
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    })
    return doctors;
}

const getDoctorById = async (id: string) => {
    const doctor = await prisma.doctor.findFirst({
        where: {
            id,
            isDeleted: false
        },
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    })
    return doctor;
}

const updateDoctor = async (id: string, payload: Record<string, unknown>) => {
    const doctor = await prisma.doctor.findFirst({
        where: {
            id,
            isDeleted: false
        }
    })

    if (!doctor) {
        return null
    }

    return prisma.doctor.update({
        where: { id },
        data: payload
    })
}

const deleteDoctor = async (id: string) => {
    const doctor = await prisma.doctor.findFirst({
        where: {
            id,
            isDeleted: false
        }
    })

    if (!doctor) {
        return null
    }

    return prisma.doctor.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date()
        }
    })
}

export const DoctorService = {
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
}