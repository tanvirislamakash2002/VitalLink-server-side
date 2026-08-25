import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router()

router.post("/create-doctor", UserController.createDoctor)
// router.post("/create-admin", UserController.createAdmin)
// router.post("/create-superadmin", UserController.createSuperAdmin)

export const UserRoutes = router;