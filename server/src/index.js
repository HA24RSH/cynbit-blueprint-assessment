import "dotenv/config";

import express from "express";
import cors from "cors";

import projectRoutes from "./routes/project.routes.js";

import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error.middleware.js";

const app = express();
app.set("trust proxy", 1);
// CORS configuration
app.use(
  cors({
    // Keep your existing configuration
  })
);

const PORT = process.env.PORT || 5000;

// Allowed frontend origins.
const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

// CORS configuration.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// Parse incoming JSON.
app.use(express.json({ limit: "50kb" }));

// Health check.
// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Cynbit Blueprint API",
    healthCheck: "/api/health",
  });
});

// Health check
// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Cynbit Blueprint API",
    healthCheck: "/api/health",
  });
});

// Health check
// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "Cynbit Blueprint API",
    healthCheck: "/api/health",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cynbit Blueprint API is running.",
    timestamp: new Date().toISOString(),
  });
});

// Project submission routes.
app.use("/api/projects", projectRoutes);

// Handle invalid routes.
app.use(notFoundHandler);

// Global error handler.
app.use(errorHandler);

// Start server.
app.listen(PORT, () => {
  console.log(`Cynbit Blueprint API running on port ${PORT}`);
});