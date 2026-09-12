import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user: IRequestUser) => {
    let statsData;

    switch (user.role) {
        case Role.SUPER_ADMIN:
            statsData = getSuperAdminStatsData();
            break;
        case Role.ADMIN:
            statsData = getAdminStatsData();
            break;
        case Role.DOCTOR:
            statsData = getDoctorStatsData();
            break;
        case Role.PATIENT:
            statsData = getPatientStatsData();
            break;
        default:
            throw new AppError(status.BAD_REQUEST, "Invalid user role")
    }
    return statsData
}

const getSuperAdminStatsData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const superAdminCount = await prisma.admin.count({
        where: {
            user: {
                role: Role.SUPER_ADMIN
            }
        }
    });
    const adminCount = await prisma.admin.count();
    const paymentCount = await prisma.payment.count();
    const userCount = await prisma.user.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
            status: PaymentStatus.PAID
        }
    })

    return {
        appointmentCount,
        doctorCount,
        patientCount,
        superAdminCount,
        adminCount,
        paymentCount,
        userCount,
        totalRevenue: totalRevenue._sum.amount || 0
    }
}

const getAdminStatsData = async () => {
    const appointmentCount = await prisma.appointment.count();
    const doctorCount = await prisma.doctor.count();
    const patientCount = await prisma.patient.count();
    const paymentCount = await prisma.payment.count();
    const userCount = await prisma.user.count();
    const adminCount = await prisma.admin.count();

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            status: PaymentStatus.PAID
        }
    })
    return {
        appointmentCount,
        doctorCount,
        patientCount,
        paymentCount,
        userCount,
        adminCount,
        totalRevenue: totalRevenue._sum.amount || 0
    }
}

const getDoctorStatsData = async (user: IRequestUser) => {

}

const getPatientStatsData = async (user: IRequestUser) => {

}

const getPieChartData = async () => {

}

const getBarChartData = async () => {

}


export const StatsService = {
    getDashboardStatsData
}