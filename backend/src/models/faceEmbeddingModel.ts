import mongoose from "mongoose";

const faceEmbeddingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  faceEmbedding: {
    type: [Number],
    required: true,
  },
});

export const FaceEmbedding = mongoose.model(
  "FaceEmbeddings",
  faceEmbeddingSchema
);
