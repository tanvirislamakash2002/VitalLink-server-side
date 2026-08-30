import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";

const MAX_COOKIE_AGE_SEC = 60 * 60 * 24 * 400;

const normalizeCookieMaxAge = (value: string) => {
    const parsedMs = Number(ms(value as StringValue));

    if (!Number.isFinite(parsedMs) || parsedMs <= 0) {
        return 60 * 60 * 24 * 7;
    }

    const parsedSec = Math.floor(parsedMs / 1000);

    return Math.min(parsedSec, MAX_COOKIE_AGE_SEC);
};

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

    session: {
        expiresIn: normalizeCookieMaxAge(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN),
        updateAge: normalizeCookieMaxAge(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE),
        cookieCache: {
            enabled: true,
            maxAge: normalizeCookieMaxAge(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN)
        }
    }

    // trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:5000'],

    // advanced: {
    //     disableCSRFCheck: true
    // }
});