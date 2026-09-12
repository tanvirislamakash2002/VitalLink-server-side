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

}

const getAdminStatsData = async () => {

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