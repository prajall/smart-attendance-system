import {
  newAttendance,
  getStudentAttendance,
} from "@/controllers/attendance.controller";
import express from "express";

const Router = express.Router();

Router.post("/", newAttendance);
Router.get("/:studentId", getStudentAttendance);

export default Router;
