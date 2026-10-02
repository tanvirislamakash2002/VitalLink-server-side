import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post("/confirm-checkout-session", checkAuth(Role.PATIENT), PaymentController.confirmCheckoutSession);

export const PaymentRoutes = router;