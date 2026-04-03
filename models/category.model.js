const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 2,
      maxlength: 100,
      trim: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
      index: true,
    },

    description: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema, "categories");
