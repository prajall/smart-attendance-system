import { Request, Response } from "express";
import { Permission } from "../../models/administration/permissionModel";

export const createPermission = async (req: Request, res: Response) => {
  const { module, action } = req.body;

  if (!module || !action) {
    return res.status(400).json({ message: "Module and Action are required" });
  }

  try {
    const duplicateData = await Permission.findOne({ module, action });
    if (duplicateData) {
      return res.status(409).json({ message: "Permission already Exists" });
    }

    const newPermission = new Permission({ module, action });
    await newPermission.save();
    return res.status(201).json({
      message: "Permission created successfully",
      permission: newPermission,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating permission", error });
  }
};
