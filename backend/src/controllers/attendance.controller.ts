import express, { Request, Response } from "express";
import { Student } from "@/models/studentModel";
import { Attendance } from "@/models/attendanceModel";

// POST request to create
export const newAttendance = async (req: Request, res: Response) => {
  const { studentId, date, isLate } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0];
    const today = new Date(date).setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      student: student._id,
      date: today,
    });

    if (existingAttendance) {
      return res
        .status(400)
        .json({ message: "Attendance already marked for today" });
    }

    const newAttendance = new Attendance({
      student: student._id,
      course: student.course,
      section: student.section,
      date: today,
      time: currentTime,
      isLate,
    });
    console.log(newAttendance);

    await newAttendance.save();

    return res.status(201).json(newAttendance);
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({
      message: "Error marking attendance",
      error: error.message,
    });
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Get current date and one year ago date
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

    const attendanceRecords = await Attendance.find({
      student: studentId,
      date: {
        $gte: oneYearAgo,
        $lte: currentDate,
      },
    });

    // Map attendance records to the desired format
    const attendanceData = attendanceRecords.map((record) => ({
      date: record.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      attendance: record.isLate ? 1 : 2, // Assuming 1 for late and 2 for present
    }));

    return res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
      },
      totalDays: attendanceData.length,
      presentDays: attendanceData.filter((r) => r.attendance === 2).length,
      lateDays: attendanceData.filter((r) => r.attendance === 1).length,
      attendanceData, // Return the modified attendance data
    });
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return res.status(500).json({
      message: "Error fetching attendance records",
      error: error.message,
    });
  }
};
