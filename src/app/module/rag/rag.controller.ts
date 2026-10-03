import { Request, Response } from "express"

const getStats = async (req: Request, res: Response) => {
    console.log('rag is connected')
}

const ingestDoctors = catchAsync(async (req: Request, res: Response) => {
    const result = await ragService.

        sendResponse(res, {
            success: true,
            httpStatusCode: status.OK,
            message: "Doctors data ingestion complete",
            data: result
        })
})

export const RagController = {
    getStats
}