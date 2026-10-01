import { Prisma } from "../../../generated/prisma/client"

export const scheduleFilterableFields = [
    'id',
    'startDateTime',
    'endDateTime',
    // 'appointments.doctors.id',
]

export const scheduleSearchableFields = [
    'id',
]

export const scheduleIncludeConfig : Partial<Record<keyof Prisma.ScheduleInclude, Prisma.ScheduleInclude[keyof Prisma.ScheduleInclude]>> ={
    appointments: {
        select: {
            id: true,
            status: true,
            paymentStatus: true,
            patient: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    },
    doctorSchedules: {
        include: {
            doctor: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    },
}