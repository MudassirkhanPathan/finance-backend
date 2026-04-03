const recordService = require("../services/record.service");

const getRecords = async (req, res) => {
  try {
    const result = await recordService.getRecords(req.query, req.user);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch records",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
      },
    });
  } catch (error) {
    console.error("Get Records Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const getRecordById = async (req, res) => {
  try {
    const result = await recordService.getRecordById(req.params.id);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Failed to fetch record",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.data,
    });
  } catch (error) {
    console.error("Get Record By ID Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const createRecord = async (req, res) => {
  try {
    const result = await recordService.createRecord(req.body, req.user);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Record creation failed",
      });
    }

    return res.status(201).json({
      result: "success",
      message: result.message || "Record created successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Create Record Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const updateRecord = async (req, res) => {
  try {
    const result = await recordService.updateRecord(req.params.id, req.body);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Update failed",
      });
    }

    return res.status(200).json({
      result: "success",
      message: result.message || "Record updated successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Update Record Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const result = await recordService.deleteRecord(req.params.id);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Delete failed",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Delete Record Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const searchRecords = async (req, res) => {
  try {
    const result = await recordService.searchRecords(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Search failed",
      });
    }

    return res.status(200).json({
      result: "success",
      data: result.results,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.pages,
      },
    });
  } catch (error) {
    console.error("Search Records Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
      error: "Internal server error",
    });
  }
};

const exportRecords = async (req, res) => {
  try {
    const result = await recordService.exportRecords(req.query);

    if (!result.status) {
      return res.status(result.statusCode || 400).json({
        result: "fail",
        message: result.error || "Export failed",
      });
    }

    //   Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=records.csv");

    return res.status(200).send(result.csv);
  } catch (error) {
    console.error("Export Records Error:", error.message);

    return res.status(500).json({
      result: "fail",
      message: error.message,
    });
  }
};

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get financial records with filters
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           example: "2026-01-01"
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           example: "2026-12-31"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Records fetched successfully
 *       400:
 *         description: Invalid query params
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get record by ID
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record fetched successfully
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
 *                     amount:
 *                       type: number
 *                     type:
 *                       type: string
 *                     category:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         type:
 *                           type: string
 *                     date:
 *                       type: string
 *                     notes:
 *                       type: string
 *       400:
 *         description: Invalid record ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "2026-04-01"
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 */
/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category_id:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "2026-04-01"
 *               notes:
 *                 type: string
 *                 example: "Salary"
 *             required:
 *               - amount
 *               - type
 *               - category_id
 *               - date
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Invalid amount or date
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Category not found
 */

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       204:
 *         description: Record deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 *       409:
 *         description: Record already deleted
 */

/**
 * @swagger
 * /api/records/search:
 *   get:
 *     summary: Search financial records (Analyst+)
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           example: "food"
 *         description: Search keyword (min 3 characters)
 *
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filter by type
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
 *           default: 20
 *           example: 10
 *         description: Number of records per page
 *
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: success
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
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
 *         description: Query too short
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/records/export:
 *   get:
 *     summary: Export records as CSV (Analyst+)
 *     tags: [Records]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           example: "2026-01-01"
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           example: "2026-12-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *     responses:
 *       200:
 *         description: CSV file response
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Viewer cannot export
 *       400:
 *         description: Invalid filters
 */

module.exports = {
  getRecords,
  getRecordById,
  createRecord,
  updateRecord,
  exportRecords,
  searchRecords,
  deleteRecord,
};
