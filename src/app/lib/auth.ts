import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { envVars } from "../../config/env";
import { bearer } from "better-auth/plugins";

const DEFAULT_SESSION_EXPIRES_SEC = 60 * 60 * 24 * 7; // 7 days in seconds

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "sqlite", ...etc
    }),
    emailAndPassword: {
        enabled: true
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
        bearer()
    ],

    session: {
        expiresIn: DEFAULT_SESSION_EXPIRES_SEC,
        updateAge: DEFAULT_SESSION_EXPIRES_SEC,
        cookieCache: {
            enabled: true,
            maxAge: DEFAULT_SESSION_EXPIRES_SEC
        }
    },

    advanced: {
        defaultCookieAttributes: {
            sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
            secure: envVars.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7
        }
    }
});