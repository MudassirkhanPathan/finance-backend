const Category = require("../models/category.model");
const mongoose = require("mongoose");
const Record = require("../models/record.model");

const getCategories = async (query) => {
  try {
    const { type, page = 1, limit = 10 } = query;

    const filter = {};

    // Optional type filter
    if (type) {
      if (!["income", "expense"].includes(type)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid category type",
        };
      }
      filter.type = type;
    }

    // Convert page & limit to number
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;

    // Total count (important  )
    const total = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .select("_id name type")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNumber);

    // Format response
    const formatted = categories.map((c) => ({
      id: c._id,
      name: c.name,
      type: c.type,
    }));

    return {
      status: true,
      statusCode: 200,
      data: formatted,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  } catch (error) {
    console.error("Get Categories Service Error:", error.message);
    throw error;
  }
};

const createCategory = async (data) => {
  try {
    const { name, type, description } = data;

    //   Check duplicate name
    const existing = await Category.findOne({
      name: name.trim().toLowerCase(),
    });

    if (existing) {
      return {
        status: false,
        statusCode: 409,
        error: "Category name already exists",
      };
    }

    //   Create category
    const category = await Category.create({
      name: name.trim(),
      type,
      description,
    });

    return {
      status: true,
      statusCode: 201,
      message: "Category created successfully",
      data: {
        id: category._id,
        name: category.name,
        type: category.type,
        description: category.description,
      },
    };
  } catch (error) {
    console.error("Create Category Service Error:", error.message);
    throw error;
  }
};

const updateCategory = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid category ID",
      };
    }

    const { name, type } = data;

    const category = await Category.findById(id);

    if (!category) {
      return {
        status: false,
        statusCode: 404,
        error: "Category not found",
      };
    }

    //   Duplicate name check (if name changed)
    if (name && name !== category.name) {
      const exists = await Category.findOne({
        name: name.trim().toLowerCase(),
      });

      if (exists) {
        return {
          status: false,
          statusCode: 409,
          error: "Category name already exists",
        };
      }

      category.name = name.trim();
    }

    //   Type update
    if (type) {
      if (!["income", "expense"].includes(type)) {
        return {
          status: false,
          statusCode: 400,
          error: "Invalid type",
        };
      }
      category.type = type;
    }

    await category.save();

    return {
      status: true,
      statusCode: 200,
      message: "Category updated successfully",
      data: {
        id: category._id,
        name: category.name,
        type: category.type,
      },
    };
  } catch (error) {
    console.error("Update Category Service Error:", error.message);
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    //   Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid category ID",
      };
    }

    const category = await Category.findById(id);

    if (!category) {
      return {
        status: false,
        statusCode: 404,
        error: "Category not found",
      };
    }

    //   Check linked records
    const count = await Record.countDocuments({
      category_id: id,
      is_deleted: false,
    });

    if (count > 0) {
      return {
        status: false,
        statusCode: 409,
        error: "Category has linked records",
      };
    }

    //   Delete category
    await Category.findByIdAndDelete(id);

    return {
      status: true,
      statusCode: 204,
    };
  } catch (error) {
    console.error("Delete Category Service Error:", error.message);
    throw error;
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
