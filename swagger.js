const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Backend API",
      version: "1.0.0",
      description: "Finance Data Processing & Access Control Backend",
    },

    servers: [
      {
        url: "https://finance-backend-ti9j.onrender.com",
        description: "Production Server",
      },
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Local Server",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      // 🔥 FULL SCHEMAS (YOUR DB MATCHED)
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "64abc123" },
            name: { type: "string", example: "Rahul Sharma" },
            email: { type: "string", example: "rahul@gmail.com" },
            role: {
              type: "string",
              enum: ["viewer", "analyst", "admin"],
            },
            is_active: { type: "boolean", example: true },
            createdAt: { type: "string", example: "2026-04-03T14:20:00Z" },
            updatedAt: { type: "string", example: "2026-04-03T14:20:00Z" },
          },
        },

        Category: {
          type: "object",
          properties: {
            id: { type: "string", example: "65xyz456" },
            name: { type: "string", example: "Food" },
            type: {
              type: "string",
              enum: ["income", "expense"],
            },
            description: {
              type: "string",
              example: "Daily expenses",
            },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },

        Record: {
          type: "object",
          properties: {
            id: { type: "string", example: "66pqr789" },
            user_id: { type: "string", example: "64abc123" },
            category_id: { type: "string", example: "65xyz456" },
            amount: { type: "number", example: 5000 },
            type: {
              type: "string",
              enum: ["income", "expense"],
            },
            date: {
              type: "string",
              example: "2026-04-03T00:00:00Z",
            },
            notes: {
              type: "string",
              example: "Food expense",
            },
            is_deleted: {
              type: "boolean",
              example: false,
            },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },

        Session: {
          type: "object",
          properties: {
            id: { type: "string" },
            user_id: { type: "string" },
            token: { type: "string" },
            expires_at: { type: "string" },
            is_revoked: { type: "boolean" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" },
          },
        },

        DashboardSummary: {
          type: "object",
          properties: {
            total_income: { type: "number", example: 12000 },
            total_expense: { type: "number", example: 2000 },
            net_balance: { type: "number", example: 10000 },
          },
        },

        ApiResponse: {
          type: "object",
          properties: {
            result: {
              type: "string",
              example: "success",
            },
            data: {
              type: "object",
            },
          },
        },
      },
    },

    security: [
      {
        BearerAuth: [],
      },
    ],
  },

  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi,
};
