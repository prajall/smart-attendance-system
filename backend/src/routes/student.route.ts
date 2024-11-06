import {
  createStudent,
  getAllStudents,
} from "@/controllers/student.controller";
import express from "express";

const Router = express.Router();
export default Router;

Router.post("/", createStudent);
Router.get("/", getAllStudents);
