require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbCheck = require("./middleware/dbCheck");
const { swaggerSpec, swaggerUi } = require("./swagger");

const app = express();

//  Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Swagger Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//  Health Check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// Base Route
app.get("/api", (req, res) => {
  res.send("Finance Backend API Running");
});

//  Routes
const routes = require("./routes/routes");
app.use("/api", routes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//DB Check
app.use("/api", dbCheck, routes);

// Global Error
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
