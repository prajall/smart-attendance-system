import { createPermission } from "@/controllers/administration/permissionController";
import express from "express";

const Router = express.Router();

Router.post("/new-permission", createPermission);

export default Router;
