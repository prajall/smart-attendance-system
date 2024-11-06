import { createCourse } from "@/controllers/course.controller";
import express from "express";

const Router = express.Router();

Router.post("/", createCourse);

export default Router;
