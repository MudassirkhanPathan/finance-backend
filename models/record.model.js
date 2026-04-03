const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be greater than 0"],
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    notes: {
      type: String,
      maxlength: 1000,
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

//  Compound index (fast filtering)
recordSchema.index({ user_id: 1, date: -1 });

module.exports = mongoose.model("Record", recordSchema, "financial_records");
