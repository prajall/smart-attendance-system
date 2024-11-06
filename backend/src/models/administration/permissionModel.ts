import mongoose, { Schema } from "mongoose";

const permissionSchema = new Schema({
  module: { type: String, required: true },
  action: { type: String, required: true },
});

export const Permission = mongoose.model("Permission", permissionSchema);
