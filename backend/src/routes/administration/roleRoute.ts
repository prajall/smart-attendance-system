import express, { Request, Response } from "express";
import {
  createRole,
  deleteRole,
  getAllRoles,
  getAllRolesWithAdmin,
  getUserRole,
  updateRole,
} from "@/controllers/administration/roleController";
import { adminChecker, checkPermission } from "@/middlewares/checkPermission";
import { authChecker } from "@/middlewares/authChecker";

const Router = express.Router();

Router.get("/", authChecker, adminChecker, getAllRoles);
Router.get("/user", authChecker, getUserRole);
Router.get("/wa", authChecker, adminChecker, getAllRolesWithAdmin);
Router.post("/new-role", authChecker, adminChecker, createRole);
Router.delete("/:roleId", authChecker, adminChecker, deleteRole);
Router.put("/:roleId/update", authChecker, adminChecker, updateRole);

//Connection for Server Side Event for roles
let clients: Response[] = [];
Router.get("/sse", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((client) => client != res);
  });
});

export const sendUpdatedRole = (data: any) => {
  console.log("Data Updated");
  return clients.forEach((client) =>
    client.write(`data: ${JSON.stringify(data)}\n\n`)
  );
};

export default Router;
