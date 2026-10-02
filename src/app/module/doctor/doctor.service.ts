import status from "http-status";
import { Doctor, Prisma } from "../../../generated/prisma/client";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { doctorFilterableFields, doctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";

// /doctors?specialty=cardiology&include=doctorSchedules,appointments
const getAllDoctors = async (query: IQueryParams) => {
    // const doctors = await prisma.doctor.findMany({
    //     where: {
    //         isDeleted: false,
    //     },
    //     include: {
    //         user: true,
    //         specialties: {
    //             include: {
    //                 specialty: true
    //             }
    //         }
    //     }
    // })

    // // const query = new QueryBuilder().paginate().search().filter();
    // return doctors;

    const queryBuilder = new QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
        prisma.doctor,
        query,
        {
            searchableFields: doctorSearchableFields,
            filterableFields: doctorFilterableFields,
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
        })
        .include({
            user: true,
            // specialties: true,
            specialties: {
                include: {
                    specialty: true
                }
            },
        })
        .dynamicInclude(doctorIncludeConfig)
        .paginate()
        .sort()
        .fields()
        .execute();

    // console.log(result);
    return result;
}

type PublicDoctorListItem = Doctor & {
    specialties: Array<{
        specialty: {
            id: string;
            title: string;
            icon: string | null;
        };
    }>;
};

const getAllPublicDoctors = async (query: IQueryParams) => {
    const queryBuilder = new QueryBuilder<PublicDoctorListItem, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
        prisma.doctor,
        query,
        {
            searchableFields: doctorSearchableFields,
            filterableFields: ["gender", "appointmentFee", "experience", "specialties.specialtyId"],
        }
    )

    const result = await queryBuilder
        .search()
        .filter()
        .where({
            isDeleted: false,
            user: { status: UserStatus.ACTIVE },
        })
        .paginate()
        .include({
            specialties: {
                include: {
                    specialty: {
                        select: { id: true, title: true, icon: true },
                    },
                },
            },
        })
        .sort()
        .execute()

    return {
        ...result,
        data: result.data.map((doctor) => ({
            id: doctor.id,
            name: doctor.name,
            email: doctor.email,
            profilePhoto: doctor.profilePhoto,
            contactNumber: doctor.contactNumber,
            address: doctor.address,
            registrationNumber: doctor.registrationNumber,
            experience: doctor.experience,
            gender: doctor.gender,
            appointmentFee: doctor.appointmentFee,
            qualification: doctor.qualification,
            currentWorkingPlace: doctor.currentWorkingPlace,
            designation: doctor.designation,
            averageRating: doctor.averageRating,
            createdAt: doctor.createdAt,
            specialties: doctor.specialties.map(({ specialty }) => ({ specialty })),
        })),
    }
}

const getDoctorById = async (id: string) => {
    const doctor = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    emailVerified: true,
                    needPasswordChange: true,
                    image: true,
                    createdAt: true,
                },
            },
            specialties: {
                include: {
                    specialty: true
                }
            },
            appointments: {
                include: {
                    patient: true,
                    schedule: true,
                    prescription: true,
                }
            },
            doctorSchedules: {
                include: {
                    schedule: true,
                }
            },
            reviews: true
        }
    })
    return doctor;
}

const getPublicDoctorById = async (id: string) => {
    return prisma.doctor.findFirst({
        where: {
            id,
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            contactNumber: true,
            address: true,
            registrationNumber: true,
            experience: true,
            gender: true,
            appointmentFee: true,
            qualification: true,
            currentWorkingPlace: true,
            designation: true,
            averageRating: true,
            specialties: {
                select: {
                    specialty: {
                        select: {
                            id: true,
                            title: true,
                            icon: true,
                        },
                    },
                },
            },
            reviews: {
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                },
            },
        },
    });
}

const getPublicDoctorSchedules = async (doctorId: string) => {
    const doctor = await prisma.doctor.findFirst({
        where: {
            id: doctorId,
            isDeleted: false,
            user: { status: UserStatus.ACTIVE },
        },
        select: { id: true },
    });

    if (!doctor) {
        throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    const schedules = await prisma.doctorSchedules.findMany({
        where: {
            doctorId: doctor.id,
            isBooked: false,
            schedule: { startDateTime: { gt: new Date() } },
        },
        select: {
            schedule: {
                select: {
                    id: true,
                    startDateTime: true,
                    endDateTime: true,
                },
            },
        },
        orderBy: { schedule: { startDateTime: "asc" } },
    });

    return schedules.map(({ schedule }) => schedule);
}

const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
    const isDoctorExist = await prisma.doctor.findUnique({
        where: {
            id,
        }
    })

    if (!isDoctorExist) {
        throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    const { doctor: doctorData, specialties } = payload;

    await prisma.$transaction(async (tx) => {
        if (doctorData) {
            await tx.doctor.update({
                where: {
                    id,
                },
                data: {
                    ...doctorData,
                }
            })
        }

        if (specialties && specialties.length > 0) {
            for (const specialty of specialties) {
                const { specialtyId, shouldDelete } = specialty;
                if (shouldDelete) {
                    await tx.doctorSpecialty.delete({
                        where: {
                            doctorId_specialtyId: {
                                doctorId: id,
                                specialtyId,
                            }
                        }
                    })
                } else {
                    await tx.doctorSpecialty.upsert({
                        where: {
                            doctorId_specialtyId: {
                                doctorId: id,
                                specialtyId,
                            }
                        },
                        create: {
                            doctorId: id,
                            specialtyId,
                        },
                        update: {}
                    })
                }
            }
        }
    })

    const doctor = await getDoctorById(id);

    return doctor;
}

//soft delete
const deleteDoctor = async (id: string) => {
    const isDoctorExist = await prisma.doctor.findUnique({
        where: { id },
        include: { user: true }
    })

    if (!isDoctorExist) {
        throw new AppError(status.NOT_FOUND, "Doctor not found");
    }

    await prisma.$transaction(async (tx) => {
        await tx.doctor.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        })

        await tx.user.update({
            where: { id: isDoctorExist.userId },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
                status: UserStatus.DELETED // Optional: you may also want to block the user
            },
        })

        await tx.session.deleteMany({
            where: { userId: isDoctorExist.userId }
        })

        await tx.doctorSpecialty.deleteMany({
            where: { doctorId: id }
        })
    })

    return { message: "Doctor deleted successfully" };
}

export const DoctorService = {
    getAllDoctors,
    getAllPublicDoctors,
    getDoctorById,
    getPublicDoctorById,
    getPublicDoctorSchedules,
    updateDoctor,
    deleteDoctor,
}