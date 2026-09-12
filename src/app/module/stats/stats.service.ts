import status from "http-status";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

const getDashboardStatsData = async (user : IRequestUser) => {

}

const getSuperAdminStatsData = async () => {

}

const getAdminStatsData = async () => {

}

const getDoctorStatsData = async (user : IRequestUser) => {

}

const getPatientStatsData = async (user : IRequestUser) => {
    
}

const getPieChartData = async () => {
    
}

const getBarChartData = async () => {
    
}


export const StatsService = {
    getDashboardStatsData
}