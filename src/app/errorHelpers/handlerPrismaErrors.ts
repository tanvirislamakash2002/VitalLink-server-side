import status from "http-status"

const getStatusCodeFromPrismaError = (errorCode: string): number => {
    if (errorCode === "P2002") {
        return status.CONFLICT
    }

    if (["P2025", "P2001", "P2015", "P2018"].includes(errorCode)) {
        return status.NOT_FOUND
    }

    if (["P1000", "P6002"].includes(errorCode)) {
        return status.UNAUTHORIZED
    }

    if (["P1010", "P6010"].includes(errorCode)) {
        return status.FORBIDDEN
    }

    if (errorCode === "P6003") {
        return status.PAYMENT_REQUIRED
    }

    if (["P1008", "P2004", "P6004"].includes(errorCode)) {
        return status.GATEWAY_TIMEOUT
    }

    if (errorCode === "P5011") {
        return status.TOO_MANY_REQUESTS
    }

    if (errorCode === "P6009") {
        return 413
    }

    if (errorCode.startsWith("P1") || ["P2024", "P2037", "P6008"].includes(errorCode)) {
        return status.SERVICE_UNAVAILABLE
    }

    if(errorCode.startsWith("P2")){
        return status.BAD_REQUEST
    }

    if(errorCode.startsWith("P3")||errorCode.startsWith("P4")){
        return status.INTERNAL_SERVER_ERROR
    }

    return status.INTERNAL_SERVER_ERROR
}