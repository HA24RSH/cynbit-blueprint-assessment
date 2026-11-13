import { Router } from "express";

import { rateLimit } from "express-rate-limit";

import {
  createProject,
} from "../controllers/project.controller.js";

const router = Router();

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});

router.post("/", submissionLimiter, createProject);

export default router;