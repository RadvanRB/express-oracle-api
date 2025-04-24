import { Router } from "express";
import { validate } from "../middlewares/requestValidator";
import { parseQueryParams } from "../middlewares/queryParser";
import { createUserSchema, updateUserSchema } from "../types/schemas/userSchema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Tento kód je jen ukázkou - v reálném projektu byste měli implementovat odpovídající controllery
router.get(
  "/",
  parseQueryParams,
  asyncHandler(async (req, res) => {
    res.json({
      message: "Seznam uživatelů - implementujte logiku",
      queryOptions: req.queryOptions,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json({
      message: `Detail uživatele s ID ${req.params.id} - implementujte logiku`,
    });
  })
);

router.post(
  "/",
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({
      message: "Uživatel vytvořen - implementujte logiku",
      data: req.body,
    });
  })
);

router.put(
  "/:id",
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    res.json({
      message: `Uživatel s ID ${req.params.id} aktualizován - implementujte logiku`,
      data: req.body,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json({
      message: `Uživatel s ID ${req.params.id} smazán - implementujte logiku`,
    });
  })
);

export default router;