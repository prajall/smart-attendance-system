import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const verifyENV = (req: Request, res: Response, next: NextFunction) => {
  const { ENV } = req.body;
  const decodedENV = jwt.verify(ENV, process.env.JWT_SECRET || "jwtsecret");
  if (!decodedENV) {
    return res.status(500).json({ message: "ENV not found" });
  }
  req.env = decodedENV;
  next();
};
