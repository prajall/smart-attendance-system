import { Response } from "express";

interface ErrorResponse {
  success: boolean;
  message: string;
  error?: any;
}

export const handleError = (res: Response, error: any): void => {
  const response: ErrorResponse = {
    success: false,
    message: "An error occurred",
  };

  if (error.name === "ValidationError") {
    response.message = "Validation Error";
    response.error = Object.values(error.errors).map((err: any) => err.message);
    res.status(400).json(response);
    return;
  }

  if (error.name === "CastError") {
    response.message = "Invalid ID format";
    res.status(400).json(response);
    return;
  }

  if (error.code === 11000) {
    response.message = "Duplicate key error";
    response.error = error.keyValue;
    res.status(409).json(response);
    return;
  }

  // Default error
  response.error = error.message;
  res.status(500).json(response);
};
