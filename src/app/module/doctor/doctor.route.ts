import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { multerUpload } from "../../../config/multer.config";
import { DoctorController } from "./doctor.controller";
import { updateDoctorZodSchema } from "./doctor.validation";

const router = Router();

router.get("/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorController.getAllDoctors);
router.get("/public", DoctorController.getAllPublicDoctors);
router.get("/public/:id/available-schedules", DoctorController.getPublicDoctorSchedules);
router.get("/public/:id", DoctorController.getPublicDoctorById);
router.get("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorController.getDoctorById);
router.patch("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("file"),
    validateRequest(updateDoctorZodSchema), DoctorController.updateDoctor);
router.delete("/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    DoctorController.deleteDoctor);

export const DoctorRoutes = router;