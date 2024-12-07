import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  classroom: { type: String, required: true },
});

const Section = mongoose.model("Section", SectionSchema);

export default Section;
