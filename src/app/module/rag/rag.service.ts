import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";

export class RAGService {
    private embeddingService: EmbeddingService;
    // private llmService: LLMService;
    private indexingService: IndexingService

    constructor() {
        this.embeddingService = new EmbeddingService();
        this.indexingService = new IndexingService();
    }

    async ingestDoctorsData() {
        return this.indexingService.indexDoctorsData()
    }

    async retieveRelevantDocuments(
        query: string,
        limit: number = 5,
        sourceType?: string
    ) {
        try {
            const queryEmbedding = await this.embeddingService.generateEmbedding(query)

            const vectorLiteral = `[${queryEmbedding.join(",")}]`

            const results = await prisma.$queryRaw(Prisma.sql`
                SELECT id, "chunkKey", "sourceType", "sourceId", "sourceLabel", content, metadata, embedding, "isDeleted", "deletedAt", "createdAt", "updatedAt", 1-(embedding <=> CAST(${vectorLiteral} AS vector)) as similarity
                FROM "document_embeddings"
                WHERE "isDeleted"=false 
                ${sourceType ? Prisma.sql`AND "sourceType"=${sourceType}` : Prisma.empty}
                ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
                LIMIT ${limit}
                `)
            return results
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async generateAnswer(
        query: string,
        limit: number = 5,
        sourceType?: string,
        asJson: boolean = false
    ) {
        try {
            const relevantDocs = await this.retieveRelevantDocuments(query, limit, sourceType)
        } catch (error) {
            console.log(error)
        }
    }
}