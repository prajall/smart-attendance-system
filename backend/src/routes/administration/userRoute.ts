import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  signupUser,
  updateUserRole,
} from "../../controllers/administration/userController";
import { authChecker } from "../../middlewares/authChecker";
import {
  adminChecker,
  checkPermission,
} from "../../middlewares/checkPermission";
import { getAllRoles } from "../../controllers/administration/roleController";

const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", signupUser);
router.get(
  "/",
  authChecker,
  adminChecker,
  checkPermission("User", "View"),
  getAllUsers
);
router.get(
  "/loggedin-user",
  authChecker,
  checkPermission("User", "View"),
  getUserInfo
);
router.patch(
  "/role/:userId",
  authChecker,
  // adminChecker,
  checkPermission("User", "Edit"),
  updateUserRole
);
router.delete(
  "/:userId",
  authChecker,
  adminChecker,
  checkPermission("User", "Delete"),
  deleteUser
);

export default router;
