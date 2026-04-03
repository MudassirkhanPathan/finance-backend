const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const registerUser = async (data) => {
  try {
    const { name, email, password, role } = data;

    //  Basic validation (extra safety)
    if (!name || !email || !password || !role) {
      return {
        status: false,
        statusCode: 400,
        error: "All fields are required",
      };
    }

    if (password.length < 8) {
      return {
        status: false,
        statusCode: 400,
        error: "Password must be at least 8 characters",
      };
    }

    //  Check existing email
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return {
        status: false,
        statusCode: 409,
        error: "Email already exists",
      };
    }

    //  Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //  Create user
    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
    });

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
      },
    };
  } catch (error) {
    console.error("Register Service Error:", error.message);
    throw error;
  }
};

const loginUser = async (data) => {
  try {
    const { email, password } = data;

    //  Check user
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("EMAIL INPUT:", email);
    console.log("USER FROM DB:", user);
    if (!user) {
      return {
        status: false,
        statusCode: 401,
        error: "Invalid credentials",
      };
    }

    // Check active
    if (!user.is_active) {
      return {
        status: false,
        statusCode: 403,
        error: "Account inactive",
      };
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return {
        status: false,
        statusCode: 401,
        error: "Invalid credentials",
      };
    }

    // Generate tokens
    const payload = {
      id: user._id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return {
      status: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  } catch (error) {
    console.error("Login Service Error:", error.message);
    throw error;
  }
};

const logoutUser = async (user) => {
  try {
    if (!user || !user.id) {
      return {
        status: false,
        statusCode: 401,
        error: "Token missing or invalid",
      };
    }
    return {
      status: true,
      statusCode: 200,
      message: "Successfully logged out",
    };
  } catch (error) {
    console.error("Logout Service Error:", error.message);
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
