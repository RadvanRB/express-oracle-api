import { Router } from "express";
import userRoutes from "./userRoutes";

const router = Router();

// Připojení dalších routerů
router.use("/users", userRoutes);

// Poznámka: controllers využívající TSOA dekorátory jsou automaticky registrovány 
// přes RegisterRoutes(app) v app.ts a není potřeba je ručně registrovat zde

export default router;