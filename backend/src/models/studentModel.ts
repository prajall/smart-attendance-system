import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    idNumber: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type: String,
    },
    // faceEmbedding: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "FaceEmbedding",
    //   required: true,
    //   // type: String,
    // },
    section: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Section",
      type: String,
    },
    course: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Course",
      // required: true,
      type: String,
    },
    batch: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", StudentSchema);
