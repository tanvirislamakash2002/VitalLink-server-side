import { envVars } from "../../../config/env";

export class EmbeddingService {
    private apiKey: string;
    private apiUrl: string = "https://openrouter.ai/api/v1";
    private embeddingModel: string;

    constructor() {
        this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "";
        this.embeddingModel = envVars.RAG.OPENROUTER_LLM_MODEL || "nvidia/llama-nemotron-embed-vl-1b-v2:free"

        if (!this.apiKey) {
            throw new Error("OPENROUTER_API_KEY is not set in .env")
        }
    }
}