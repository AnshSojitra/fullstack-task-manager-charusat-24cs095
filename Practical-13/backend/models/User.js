const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema Definition
 * Practical 7: Authentication and Middleware Pipeline
 * CHARUSAT ITUE301 - Ansh Sojitra (24CS095)
 *
 * Requirements:
 * - name: String, required, trimmed
 * - email: String, required, unique, normalized (lowercase & trimmed), valid email format
 * - password: String, required, minimum 6 characters (hashed with bcryptjs before save)
 * - Safe JSON serialization: Never expose password or password hash to clients
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      validate: {
        validator: function (v) {
          return typeof v === "string" && v.trim().length > 0;
        },
        message: "Name cannot be empty or whitespace only.",
      },
    },
    email: {
      type: String,
      required: [true, "Email address is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address.",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Pre-save hook: Hash password with bcryptjs before saving to MongoDB
 * Never stores plaintext passwords in the database.
 */
userSchema.pre("save", async function () {
  // Only hash password if it has been modified or is newly created
  if (!this.isModified("password")) {
    return;
  }

  // Generate cryptographic salt (cost factor 10) and compute hash
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method: Compare candidate plaintext password against stored bcrypt hash
 * @param {string} candidatePassword - Plaintext password provided by user
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method: Return safe user profile object without sensitive credentials
 */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
