const Record = require("../models/record.model");
const Category = require("../models/category.model");
const mongoose = require("mongoose");

const getRecords = async (query) => {
  try {
    let { type, category_id, date_from, date_to, page = 1, limit = 20 } = query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 100);

    const filter = {
      is_deleted: false,
    };

    // Type filter
    if (type) {
      if (!["income", "expense"].includes(type)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid type value",
        };
      }
      filter.type = type;
    }

    // Category filter
    if (category_id) {
      filter.category_id = category_id;
    }

    // Date filter
    if (date_from || date_to) {
      filter.date = {};

      if (date_from) {
        const fromDate = new Date(date_from);
        if (isNaN(fromDate)) {
          return {
            status: false,
            statusCode: 400,
            error: "Invalid date_from format",
          };
        }
        filter.date.$gte = fromDate;
      }

      if (date_to) {
        const toDate = new Date(date_to);
        if (isNaN(toDate)) {
          return {
            status: false,
            statusCode: 400,
            error: "Invalid date_to format",
          };
        }
        filter.date.$lte = toDate;
      }
    }

    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Record.find(filter).sort({ date: -1 }).skip(skip).limit(limit),

      Record.countDocuments(filter),
    ]);

    return {
      status: true,
      statusCode: 200,
      data: records,
      total,
      page,
      limit, //   add this
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Get Records Service Error:", error.message);
    throw error;
  }
};

const getRecordById = async (id) => {
  try {
    //   Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid record ID",
      };
    }

    //  Find record + populate category
    const record = await Record.findById(id)
      .populate("category_id", "name type")
      .where({ is_deleted: false });

    if (!record) {
      return {
        status: false,
        statusCode: 404,
        error: "Record not found",
      };
    }

    //  Format response
    const formatted = {
      id: record._id,
      amount: record.amount,
      type: record.type,
      category: record.category_id
        ? {
            id: record.category_id._id,
            name: record.category_id.name,
            type: record.category_id.type,
          }
        : null,
      date: record.date,
      notes: record.notes,
    };

    return {
      status: true,
      statusCode: 200,
      data: formatted,
    };
  } catch (error) {
    console.error("Get Record By ID Service Error:", error.message);
    throw error;
  }
};

const createRecord = async (data, user) => {
  try {
    const { amount, type, category_id, date, notes } = data;

    //   Amount validation
    if (amount <= 0) {
      return {
        status: false,
        statusCode: 400,
        error: "Amount must be greater than 0",
      };
    }

    //   Type validation
    if (!["income", "expense"].includes(type)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid type value",
      };
    }

    //   Date validation
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid date format",
      };
    }

    //   Category existence check
    if (!mongoose.Types.ObjectId.isValid(category_id)) {
      return {
        status: false,
        statusCode: 422,
        error: "Invalid category_id",
      };
    }

    const category = await Category.findById(category_id);

    if (!category) {
      return {
        status: false,
        statusCode: 422,
        error: "Category not found",
      };
    }

    //   Type match (important)
    if (category.type !== type) {
      return {
        status: false,
        statusCode: 400,
        error: "Category type mismatch",
      };
    }

    //   Create record
    const record = await Record.create({
      user_id: user.id,
      category_id,
      amount,
      type,
      date: parsedDate,
      notes,
    });

    //   Audit log
    console.log("AUDIT: record.created", record._id);

    return {
      status: true,
      statusCode: 201,
      message: "Record created successfully",
      data: {
        id: record._id,
        amount: record.amount,
        type: record.type,
        category_id: record.category_id,
        date: record.date,
        notes: record.notes,
      },
    };
  } catch (error) {
    console.error("Create Record Service Error:", error.message);
    throw error;
  }
};

const updateRecord = async (id, data) => {
  try {
    //   Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid record ID",
      };
    }

    //   Find record
    const record = await Record.findById(id);

    if (!record || record.is_deleted) {
      return {
        status: false,
        statusCode: 404,
        error: "Record not found",
      };
    }

    const { amount, type, category_id, date, notes } = data;

    const updateFields = {};

    //   Amount validation
    if (amount !== undefined) {
      if (amount <= 0) {
        return {
          status: false,
          statusCode: 400,
          error: "Amount must be greater than 0",
        };
      }
      updateFields.amount = amount;
    }

    //   Type validation
    if (type) {
      if (!["income", "expense"].includes(type)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid type value",
        };
      }
      updateFields.type = type;
    }

    //   Category validation
    if (category_id) {
      if (!mongoose.Types.ObjectId.isValid(category_id)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid category_id",
        };
      }

      const category = await Category.findById(category_id);

      if (!category) {
        return {
          status: false,
          statusCode: 404,
          error: "Category not found",
        };
      }

      //   Type match check
      if (type && category.type !== type) {
        return {
          status: false,
          statusCode: 400,
          error: "Category type mismatch",
        };
      }

      updateFields.category_id = category_id;
    }

    //   Date validation
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid date format",
        };
      }
      updateFields.date = parsedDate;
    }

    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    //   Update
    const updated = await Record.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true },
    );

    //   Audit log
    console.log("AUDIT: record.updated", id);

    return {
      status: true,
      statusCode: 200,
      message: "Record updated successfully",
      data: updated,
    };
  } catch (error) {
    console.error("Update Record Service Error:", error.message);
    throw error;
  }
};

const deleteRecord = async (id) => {
  try {
    //   Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid record ID",
      };
    }

    //   Find record
    const record = await Record.findById(id);

    if (!record) {
      return {
        status: false,
        statusCode: 404,
        error: "Record not found",
      };
    }

    // Already deleted check
    if (record.is_deleted) {
      return {
        status: false,
        statusCode: 409,
        error: "Record already deleted",
      };
    }

    // Soft delete
    record.is_deleted = true;
    await record.save();

    //Audit log
    console.log("AUDIT: record.deleted", id);

    return {
      status: true,
      statusCode: 204,
    };
  } catch (error) {
    console.error("Delete Record Service Error:", error.message);
    throw error;
  }
};

const searchRecords = async (query) => {
  try {
    let { q, type, page = 1, limit = 20 } = query;

    // Validate query
    if (!q || q.trim().length < 3) {
      return {
        status: false,
        statusCode: 400,
        error: "Query must be at least 3 characters",
      };
    }

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 50);

    const skip = (page - 1) * limit;

    const filter = {
      is_deleted: false,
      notes: { $regex: q, $options: "i" },
    };

    // Optional type filter
    if (type) {
      if (!["income", "expense"].includes(type)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid type filter",
        };
      }
      filter.type = type;
    }

    const [results, total] = await Promise.all([
      Record.find(filter).sort({ date: -1 }).skip(skip).limit(limit),

      Record.countDocuments(filter),
    ]);

    return {
      status: true,
      statusCode: 200,
      results,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Search Records Service Error:", error.message);
    throw error;
  }
};

const exportRecords = async (query) => {
  try {
    const { date_from, date_to, type } = query;

    const filter = {
      is_deleted: false,
    };

    //   Type filter
    if (type) {
      if (!["income", "expense"].includes(type)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid type filter",
        };
      }
      filter.type = type;
    }

    //   Date filter
    if (date_from || date_to) {
      filter.date = {};

      if (date_from) {
        const from = new Date(date_from);
        if (isNaN(from)) {
          return {
            status: false,
            statusCode: 400,
            error: "Invalid date_from",
          };
        }
        filter.date.$gte = from;
      }

      if (date_to) {
        const to = new Date(date_to);
        if (isNaN(to)) {
          return {
            status: false,
            statusCode: 400,
            error: "Invalid date_to",
          };
        }
        filter.date.$lte = to;
      }
    }

    //   Fetch records
    const records = await Record.find(filter)
      .populate("category_id", "name")
      .sort({ date: -1 });

    //   Build CSV
    const headers = ["ID", "Amount", "Type", "Category", "Date", "Notes"];

    const rows = records.map((r) => [
      r._id,
      r.amount,
      r.type,
      r.category_id?.name || "",
      r.date.toISOString().split("T")[0],
      (r.notes || "").replace(/,/g, " "), // avoid CSV break
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );

    return {
      status: true,
      statusCode: 200,
      csv,
    };
  } catch (error) {
    console.error("Export Records Service Error:", error.message);
    throw error;
  }
};

module.exports = {
  getRecords,
  deleteRecord,
  getRecordById,
  searchRecords,
  exportRecords,
  createRecord,
  updateRecord,
};
