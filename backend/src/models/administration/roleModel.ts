import mongoose, { Schema } from "mongoose";

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  permissions: [
    {
      module: { type: String },
      actions: [{ type: String }],
    },
  ],
});

export const Role = mongoose.model("Role", roleSchema);

// const roleSchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   permissions: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "Permission",
//     },
//   ],
// });

// const role = {
//   name: "Employee",
//   permissions: [
//     {
//       module: {
//         name: "Product",
//         action: ["update", "add", "delete", "view"],
//       },
//     },
//     {
//       module: {
//         name: "Order",
//         action: ["view"],
//       },
//     },
//   ],
// };
