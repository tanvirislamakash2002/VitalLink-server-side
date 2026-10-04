import { Request, Response } from "express"
import { catchAsync } from "../../shared/catchAsync"
import status from "http-status"
import { RAGService } from "./rag.service"
import { sendResponse } from "../../shared/sendResponse"

const ragService = new RAGService()
const getStats = async (req: Request, res: Response) => {
    console.log('rag is connected')
}

const ingestDoctors = catchAsync(async (req: Request, res: Response) => {
    const result = await ragService.ingestDoctorsData()

    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Doctors data ingestion complete",
        data: result
    })
})

const queryRag = catchAsync(async (req: Request, res: Response) => {

    const { query } = req.body;

    if (!query) {
        return sendResponse(res, {
            success: false,
            httpStatusCode: status.BAD_REQUEST,
            message: "Query is required"
        })
    }

    const result = await ragService.generateAnswer()
    
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: "Doctors data ingestion complete",
        data: result
    })
})

export const RagController = {
    getStats,
    ingestDoctors
}