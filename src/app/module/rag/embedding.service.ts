import { envVars } from "../../../config/env";

interface OpenRouterEmbeddingResponse {
    data?: Array<{ embedding?: unknown }>;
    error?: { message?: string };
}

export class EmbeddingService {
    private apiKey: string;
    private apiUrl: string = "https://openrouter.ai/api/v1";
    private embeddingModel: string;

    constructor() {
        this.apiKey = envVars.RAG.OPENROUTER_API_KEY || "";
        this.embeddingModel = envVars.RAG.OPENROUTER_EMBEDDING_MODEL || "nvidia/llama-nemotron-embed-vl-1b-v2:free"

        if (!this.apiKey) {
            throw new Error("OPENROUTER_API_KEY is not set in .env")
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
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

        const data = await response.json() as OpenRouterEmbeddingResponse;
        if (!response.ok) {
            throw new Error(`OpenRouter embeddings failed (${response.status}): ${data.error?.message ?? response.statusText}`);
        }

        const embedding = data.data?.[0]?.embedding;
        if (!Array.isArray(embedding) || embedding.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
            throw new Error("OpenRouter returned a missing or invalid embedding vector");
        }
        if (embedding.length !== 2048) {
            throw new Error(`OpenRouter embedding has ${embedding.length} dimensions; document_embeddings requires 2048`);
        }

        return embedding as number[];
    }
}