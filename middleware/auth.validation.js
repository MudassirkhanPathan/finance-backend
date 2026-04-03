const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["viewer", "analyst", "admin"]),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
  };
};
const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  is_active: z.boolean().optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(["viewer", "analyst", "admin"]),
});
const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(["income", "expense"]),
  category_id: z.string(),
  date: z.string(),
  notes: z.string().max(500).optional(),
});
const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["income", "expense"]).optional(),
  category_id: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});
const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(["income", "expense"]),
  description: z.string().max(500).optional(),
});
const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(["income", "expense"]).optional(),
});
module.exports = {
  validate,
  createRecordSchema,
  createCategorySchema,
  registerSchema,
  updateCategorySchema,
  loginSchema,
  updateRecordSchema,
  updateUserSchema,
  updateRoleSchema,
};
