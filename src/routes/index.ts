import { Router } from "express";
import userRoutes from "./userRoutes";

const router = Router();

// Připojení dalších routerů
router.use("/users", userRoutes);

export default router;