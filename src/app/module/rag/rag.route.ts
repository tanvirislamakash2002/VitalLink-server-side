import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { RagController } from "./rag.controller";

const router = Router();
router.get("/stats", RagController.getStats)

router.post("/ingest-doctors", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), RagController.ingestDoctors)

router.post("/query", RagController.queryRag)

export const RagRoutes = router