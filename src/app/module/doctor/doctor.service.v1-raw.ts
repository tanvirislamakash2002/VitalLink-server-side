/* eslint-disable @typescript-eslint/no-explicit-any */

import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

type QueryParams = {
    // reserved word
    searchTerm?: string;
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    fields?: string;

    // filterable fields
    gender?: string;
    experience?: string;

    [key: string]: unknown;
}
const getAllDoctors = async (query: QueryParams) => {

    // Step-1 : Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10

    const skip = (page - 1) * limit;

    // Step-2 : Sort

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

    let orderBy: Record<string, any>;

    if (sortBy.includes(".")) {
        // nested object string
        const [relation, field] = sortBy.split(".");

        orderBy = {
            [relation]: {
                [field]: sortOrder,
            },
        };
    } else {
        orderBy = {
            [sortBy]: sortOrder,
        };
    }

    // Step 3 - Searching
    const searchConditions: Prisma.DoctorWhereInput[] = []
    const searchableFields = ["name", "designation"]

    if (query.searchTerm) {
        const searchTerm = query.searchTerm

        // searchConditions.push(
        //     {
        //         name: { contains: searchTerm, mode: "insensitive" }
        //     },
        //     {
        //         email: { contains: searchTerm, mode: "insensitive" }
        //     },
        //     {
        //         designation: { contains: searchTerm, mode: "insensitive" }
        //     },
        //     {
        //         qualification: { contains: searchTerm, mode: "insensitive" }
        //     },
        //     {
        //         currentWorkingPlace: { contains: searchTerm, mode: "insensitive" }
        //     },
        //     {
        //         registrationNumber: { contains: searchTerm, mode: "insensitive" }
        //     }
        // )

        searchableFields.forEach(field => {
            searchConditions.push({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            })
        })

        searchConditions.push({
            specialties: {
                some: {
                    specialty: {
                        title: {
                            contains: searchTerm,
                            mode: "insensitive"
                        }
                    }
                }
            }
        })
    }

    // Step - 4: Filtering

    const doctors = await prisma.doctor.findMany({
        where: {
            OR: searchConditions.length > 0 ? searchConditions : undefined,
            isDeleted: false
        },
        skip,
        take: limit,
        orderBy,
        include: {
            user: true,
            specialties: {
                include: {
                    specialty: true
                }
            }
        }
    })
    return {
        data: doctors,
        meta: {
            page,
            limit,
            total: doctors.length,
            totalPages: Math.ceil(doctors.length / limit)
        }
    }
}

export const DoctorServiceV1Raw = {
    getAllDoctors
}