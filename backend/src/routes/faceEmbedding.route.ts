import {
  createFaceEmbedding,
  exportFaceEmbeddingsToCSV,
} from "@/controllers/faceEmbedding.controller";
import express from "express";

const Router = express.Router();

Router.post("/", createFaceEmbedding);
Router.get("/export", exportFaceEmbeddingsToCSV);

export default Router;
