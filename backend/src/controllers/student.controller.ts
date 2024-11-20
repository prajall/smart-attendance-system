import { Student } from "@/models/studentModel";
import { Request, Response } from "express";

export const createStudent = async (req: Request, res: Response) => {
  const {
    name,
    idNumber,
    email,
    phone,
    section,
    courseRef, // Renamed from course in your form code
    batch,
    dateOfBirth,
    contactNo,
    photoUrl, // Added for photo URL
    guardianName,
    guardianContact,
  } = req.body;

  console.log("Request Body: ", req.body);
  try {
    const existingStudent = await Student.findOne({
      $or: [{ idNumber }, { email }],
    });
    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Student with this ID or email already exists" });
    }

    const newStudent = await Student.create({
      name,
      idNumber,
      email,
      phone,
      section,
      courseRef,
      batch,
      dateOfBirth,
      contactNo,
      photoUrl,
      guardianName,
      guardianContact,
    });

    if (!newStudent) {
      return res.status(500).json({ message: "Error creating student" });
    }
    console.log("New Student: ", newStudent);

    return res.status(201).json(newStudent);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error creating student",
      error: error.message,
    });
  }
};
export const getAllStudents = async (req: Request, res: Response) => {
  const { section, course, batch } = req.body;

  const studentDoc = await Student.find({ section, course, batch });

  if (!studentDoc) {
    return res.status(404).json(studentDoc);
  }
};
