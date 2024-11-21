import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app";
import { dbName } from "./constants";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";

// app.listen(PORT, async () => {
//   console.log(`Server is running on port ${PORT}`);

//   try {
//     await mongoose.connect(`${MONGODB_URI}/${dbName}`);
//     console.log("Database Connected Successfully");
//   } catch (error) {
//     console.error("Database Connection Error:", error);
//   }
// });

// ============ Web Socket Server ================

import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected to websocket: ", socket.id);

  socket.on("message", (msg) => {
    console.log("Message: ", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3001, async () => {
  console.log("Server is running..");
  try {
    await mongoose.connect(`${MONGODB_URI}/${dbName}`);
    console.log("Database Connected Successfully");
  } catch (error) {
    console.error("Database Connection Error:", error);
  }
});
