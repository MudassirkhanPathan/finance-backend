const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const getUsers = async (query) => {
  try {
    let { page = 1, limit = 20, role, is_active } = query;

    page = parseInt(page);
    limit = Math.min(parseInt(limit), 100);

    const filter = {};

    if (role) filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === "true";

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password_hash")
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 }),

      User.countDocuments(filter),
    ]);

    return {
      status: true,
      statusCode: 200,
      data: users,
      total,
      page,
      limit, //   add this
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Get Users Service Error:", error.message);
    throw error;
  }
};
const getUserById = async (id) => {
  try {
    //   Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid user ID",
      };
    }

    //   Find user
    const user = await User.findById(id).select("-password_hash");

    if (!user) {
      return {
        status: false,
        statusCode: 404,
        error: "User not found",
      };
    }

    return {
      status: true,
      statusCode: 200,
      data: user,
    };
  } catch (error) {
    console.error("Get User By ID Service Error:", error.message);
    throw error;
  }
};

const createUser = async (data) => {
  try {
    const { name, email, password, role } = data;

    //   Check existing email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        status: false,
        statusCode: 409,
        error: "Email already exists",
      };
    }

    //   Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //   Create user
    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
      is_active: true,
    });

    //   (Optional) Audit log
    console.log("AUDIT: user.created", user._id);

    return {
      status: true,
      statusCode: 201,
      message: "User created successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
    };
  } catch (error) {
    console.error("Create User Service Error:", error.message);
    throw error;
  }
};

const updateUser = async (userId, updateData) => {
  try {
    //   Check user exists
    const existingUser = await User.findById(userId);

    if (!existingUser) {
      return {
        status: false,
        statusCode: 404,
        error: "User not found",
      };
    }

    //   Optional: prevent email duplicate
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists) {
        return {
          status: false,
          statusCode: 400,
          error: "Email already in use",
        };
      }
    }

    //  Update fields
    if (updateData.name !== undefined) {
      existingUser.name = updateData.name;
    }

    if (updateData.email !== undefined) {
      existingUser.email = updateData.email;
    }

    if (updateData.is_active !== undefined) {
      existingUser.is_active = updateData.is_active;
    }

    await existingUser.save();

    // Audit log (mock)
    console.log(`Audit: User ${userId} updated`, updateData);

    return {
      status: true,
      statusCode: 200,
      message: "User updated successfully",
      data: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        is_active: existingUser.is_active,
      },
    };
  } catch (error) {
    console.error("Update User Service Error:", error.message);
    throw error;
  }
};

const updateUserRole = async (id, role) => {
  try {
    //   Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid user ID",
      };
    }

    //   Check user exists
    const user = await User.findById(id);

    if (!user) {
      return {
        status: false,
        statusCode: 404,
        error: "User not found",
      };
    }

    //   Update role
    user.role = role;
    await user.save();

    //   Audit log
    console.log("AUDIT: user.role.updated", id, role);

    return {
      status: true,
      statusCode: 200,
      message: "Role updated successfully",
      data: {
        id: user._id,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Update Role Service Error:", error.message);
    throw error;
  }
};

const deleteUser = async (id, currentUserId) => {
  try {
    //  Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        status: false,
        statusCode: 400,
        error: "Invalid user ID",
      };
    }

    //  Prevent self delete
    if (id === currentUserId) {
      return {
        status: false,
        statusCode: 403,
        error: "Cannot delete self",
      };
    }

    //  Find user
    const user = await User.findById(id);

    if (!user) {
      return {
        status: false,
        statusCode: 404,
        error: "User not found",
      };
    }

    //  Soft delete
    user.is_active = false;
    await user.save();

    //  Audit log
    console.log("AUDIT: user.deleted", id);

    return {
      status: true,
      statusCode: 204,
    };
  } catch (error) {
    console.error("Delete User Service Error:", error.message);
    throw error;
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
};
