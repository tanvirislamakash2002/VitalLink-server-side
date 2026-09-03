import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env";
import { bearer, emailOTP } from "better-auth/plugins";
import { sendEmail } from "../utils/email";

const DEFAULT_SESSION_EXPIRES_SEC = 60 * 60 * 24 * 7; // 7 days in seconds

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },

    socialProviders: {
        google: {
            clientId: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: () => {
                return {
                    role: Role.PATIENT,
                    status: UserStatus.ACTIVE,
                    needPasswordChange: false,
                    emailVerified: true,
                    isDeleted: false,
                    deletedAt: null
                }
            }
        }
    },
    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
    },

    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.PATIENT
            },
            status: {
                type: "string",
                required: true,
                defaultValue: UserStatus.ACTIVE
            },
            needPasswordChange: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null
            }
        }
    },

    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "email-verification") {
                    const user = await prisma.user.findUnique({
                        where: {
                            email,
                        }
                    })
                    if (user && !user.emailVerified) {
                        sendEmail({
                            to: email,
                            subject: "Verify your email",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp
                            }
                        })
                    }
                } else if (type === "forget-password") {
                    const user = await prisma.user.findUnique({
                        where: {
                            email
                        }
                    })

                    if (user) {
                        sendEmail({
                            to: email,
                            subject: "Password Reset OTP",
                            templateName: "otp",
                            templateData: {
                                name: user.name,
                                otp
                            }
                        })
                    }
                }
            },
            expiresIn: 2 * 60,
            otpLength: 6
        })
    ],

    session: {
        expiresIn: DEFAULT_SESSION_EXPIRES_SEC,
        updateAge: DEFAULT_SESSION_EXPIRES_SEC,
        cookieCache: {
            enabled: true,
            maxAge: DEFAULT_SESSION_EXPIRES_SEC
        }
    },

    redirectURLs: {
        signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`
    },

    trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:5000", envVars.FRONTEND_URL],

    advanced: {
        // disableCSRFCheck:true,
        defaultCookieAttributes: {
            sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
            secure: envVars.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7
        },
        useSecureCookies: false,
        cookies: {
            state: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/"
                }
            },
            sessionToken: {
                attributes: {
                    sameSite: "none",
                    secure: true,
                    httpOnly: true,
                    path: "/"
                }
            }
        }
    }
});