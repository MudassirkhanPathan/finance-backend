const categoryService = require("../services/category.service");

const getCategories = async (req, res) => {
  try {
    const result = await categoryService.getCategories(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch categories",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
      pagination: result.pagination, 
    });
  } catch (error) {
    console.error("Get Categories Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const result = await categoryService.createCategory(req.body);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Category creation failed",
      });
    }

    return res.status(201).json({
      result: "success",
      message: result.message || "Category created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Create Category Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const result = await categoryService.updateCategory(
      req.params.id,
      req.body,
    );

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Category update failed",
      });
    }

    return res.status(200).json({
      result: "success",
      message: result.message || "Category updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Update Category Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Delete failed",
      });
    }

    return res.status(204).send(); 
  } catch (error) {
    console.error("Delete Category Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *           example: expense
 *         description: Filter by category type
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Number of records per page
 *
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
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
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *
 *       400:
 *         description: Invalid category type
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create new category (Admin only)
 *     tags: [Categories]
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
 *                 example: "Food"
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               description:
 *                 type: string
 *                 example: "Daily food expenses"
 *             required:
 *               - name
 *               - type
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 *       409:
 *         description: Category already exists
 */
/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Food"
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       204:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category has linked records
 */
module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
