import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import { dbName } from "./constants";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await mongoose.connect(`${MONGODB_URI}/${dbName}`);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database Connection Error:", error);
  }
});
