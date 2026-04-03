require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbCheck = require("./middleware/dbCheck");
const { swaggerSpec, swaggerUi } = require("./swagger");

const app = express();

//   CORS (production safe)
app.use(
  cors({
    origin: "*",
  }),
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//   Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//   Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

//   Root route (important for Render)
app.get("/", (req, res) => {
  res.send("Finance Backend API is Live");
});

//   API base route
app.get("/api", (req, res) => {
  res.send("Finance Backend API Running");
});

//   Routes (ONLY ONCE + with dbCheck)
const routes = require("./routes/routes");
app.use("/api", dbCheck, routes);

app.use("/api", routes);

//   404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//   Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
