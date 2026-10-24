const mongoose = require("mongoose");

/**
 * Task Schema Definition
 * Practical 5: CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Requirements:
 * - title: String, required, trimmed of whitespace
 * - description: String, optional
 * - completed: Boolean, default false
 * - createdAt: Date, default Date.now
 * - priority: String, enum ['low', 'medium', 'high'], default 'medium'
 * - Trim title whitespace with a pre-save hook or appropriate schema setter
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required and cannot be empty."],
      trim: true,
      // Custom validator to disallow whitespace-only string
      validate: {
        validator: function (v) {
          return typeof v === "string" && v.trim().length > 0;
        },
        message: "Title cannot be empty or whitespace only.",
      },
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "'{VALUE}' is not a valid priority. Allowed values: low, medium, high.",
      },
      default: "medium",
      lowercase: true,
      trim: true,
    },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Pre-save hook to ensure title whitespace is trimmed before saving
taskSchema.pre("save", function (next) {
  if (this.title && typeof this.title === "string") {
    this.title = this.title.trim();
  }
  if (this.description && typeof this.description === "string") {
    this.description = this.description.trim();
  }
  if (typeof next === "function") {
    next();
  }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
