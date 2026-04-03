const authService = require("../services/auth.service");

const registerUser = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Registration failed",
      });
    }

    return res.status(201).json({
      result: "success",
      message: result.message || "User created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: "Internal server error",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Login failed",
      });
    }

    return res.status(result.statusCode || 200).json({
      result: "success",
      message: result.message || "Login successful",
      data: result.data || null,
    });
  } catch (error) {
    console.error("Login Controller Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const result = await authService.logoutUser(req.user);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Logout failed",
      });
    }

    return res.status(200).json({
      result: "success",
      message: result.message || "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Controller Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Mudassir Khan"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "mudassir@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [viewer, analyst, admin]
 *                 example: "viewer"
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "661a2c9b1234567890abcd12"
 *                     name:
 *                       type: string
 *                       example: "Mudassir Khan"
 *                     email:
 *                       type: string
 *                       example: "mudassir@example.com"
 *                     role:
 *                       type: string
 *                       example: "viewer"
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin only
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@finance.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "admin123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful with tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "661a2c9b1234567890abcd12"
 *                         name:
 *                           type: string
 *                           example: "Super Admin"
 *                         email:
 *                           type: string
 *                           example: "admin@finance.com"
 *                         role:
 *                           type: string
 *                           example: "admin"
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account inactive
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Token missing or invalid
 */

module.exports = { registerUser, loginUser, logoutUser };
