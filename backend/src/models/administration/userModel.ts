import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "User",
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      default: new mongoose.Types.ObjectId("66cf1685fbfb379ffe2b8703"),
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("users", userSchema);
