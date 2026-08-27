import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/errorinterface";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
    const statusCode = status.BAD_REQUEST;
    const message = "Zod Validation Error"
    const errorSources: TErrorSources[] = []
    err.issues.forEach(issue => {
        errorSources.push({
            path: issue.path.join(" ") || "unknown",
            // path: issue.path.length > 1 ? issue.path.join("=>") : issue.path[0].toString() || "unknown",
            message: issue.message
        })
    })
    return {
        success: false,
        message,
        errorSources,
        statusCode
    }
}