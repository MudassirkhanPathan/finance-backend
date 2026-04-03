const userService = require("../services/user.service");

const getUsers = async (req, res) => {
  try {
    const result = await userService.getUsers(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch users",
      });
    }

    return res.status(200).json({
      result: "success",
      message: "Users fetched successfully",
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
      },
    });
  } catch (error) {
    console.error("Get Users Controller Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const result = await userService.getUserById(req.params.id);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch user",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Get User By ID Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const result = await userService.createUser(req.body);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "User creation failed",
      });
    }

    return res.status(201).json({
      result: "success",
      message: result.message || "User created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Create User Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "User update failed",
      });
    }

    return res.status(200).json({
      result: "success",
      message: result.message || "User updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Update User Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const result = await userService.updateUserRole(
      req.params.id,
      req.body.role,
    );

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Role update failed",
      });
    }

    return res.status(200).json({
      result: "success",
      message: result.message || "Role updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Update Role Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(
      req.params.id,
      req.user.id, 
    );

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Delete failed",
      });
    }

    return res.status(204).send(); 
  } catch (error) {
    console.error("Delete User Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Number of users per page
 *
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [viewer, analyst, admin]
 *         description: Filter by role
 *
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *
 *                 message:
 *                   type: string
 *                   example: Users fetched successfully
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       is_active:
 *                         type: boolean
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     is_active:
 *                       type: boolean
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
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
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot delete self
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [viewer, analyst, admin]
 *                 example: analyst
 *             required:
 *               - role
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: User not found
 */
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Name"
 *               email:
 *                 type: string
 *                 example: "updated@example.com"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: User not found
 *       409:
 *         description: Email already exists
 */
module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
};
