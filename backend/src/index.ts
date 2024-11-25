import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import { dbName } from "./constants";
import http from "http";
import { setupWebSocket } from "./websocket/socket";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// Create the HTTP server
const server = http.createServer(app);

// Initialize WebSocket
setupWebSocket(server);

// Start the server
server.listen(3001, async () => {
  console.log("Server is running..");
  try {
    await mongoose.connect(`${MONGODB_URI}/${dbName}`);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database Connection Error:", error);
  }
});
