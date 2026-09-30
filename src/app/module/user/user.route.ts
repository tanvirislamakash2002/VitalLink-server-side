import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../../config/multer.config";

const router = Router()

router.post(
    "/create-doctor",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(createDoctorZodSchema),
    UserController.createDoctor
)
// router.post("/create-admin", UserController.createAdmin)
// router.post("/create-superadmin", UserController.createSuperAdmin)

export const UserRoutes = router;