import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
// import permissionRoute from "@/routes/administration/permissionRoute";
// import userRoute from "@/routes/administration/user.route";
import attendanceRoute from "@/routes/attendance.route";
import studentRoute from "@/routes/student.route";
import faceEmbeddingRoute from "@/routes/faceEmbedding.route";
import courseRoute from "@/routes/course.route";
const app = express();

export default app;

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

// SETUP ROUTES
// app.use("/user", userRoute);
app.use("/attendance", attendanceRoute);
app.use("/student", studentRoute);
app.use("/face-embedding", faceEmbeddingRoute);
app.use("/course", courseRoute);

// app.use("/permission", permissionRoute);
// app.use("/role", roleRoute);
