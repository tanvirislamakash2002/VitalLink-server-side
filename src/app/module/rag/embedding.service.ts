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

    async generateEmbedding(text: string) {
        try {
            const response = await fetch(`${this.apiUrl}/embeddings`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    input: text,
                    model: this.embeddingModel
                })
            })

            if (!response.ok) {
                throw new Error(`OpenRouter API Error; ${response.status}`)
            }
            const data = await response.json()

            if (!data.data || data.data.length == 0) {
                throw new Error("No embedding data returned")
            }
            return data.data[0].embedding;
        } catch (error) {
            console.log(error)
        }
    }
}