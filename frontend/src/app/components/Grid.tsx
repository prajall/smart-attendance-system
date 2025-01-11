"use client";

import axios from "axios";
import React, { useState, useRef, useEffect } from "react";

export interface AttendanceDay {
  date: string;
  attendance: number;
}

const getColor = (attendance: number) => {
  switch (attendance) {
    case 0:
      return "#ffffff"; // White for absent
    case 1:
      return "#add8e6"; // Light blue for late
    case 2:
      return "#2671c6"; // Blue for present
    default:
      return "#ffffff"; // Default white for no record
  }
};

const SmoothTooltip: React.FC<{
  content: string;
  position: { x: number; y: number };
  attendance: string;
}> = ({ content, position, attendance }) => {
  return (
    <div
      className="absolute z-10 px-3 py-2 text-sm text-black bg-white border border-zinc-300 rounded shadow-lg transition-all duration-300 ease-out opacity-0 scale-95 pointer-events-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        opacity: 1,
        scale: "1",
      }}
    >
      <p>
        Date: <span className="text-muted-foreground">{content}</span>
      </p>
      <p>
        Attendance: <span className="text-muted-foreground">{attendance}</span>
      </p>
    </div>
  );
};

const AttendanceGrid = ({ studentId }: { studentId: string }) => {
  const [activeDay, setActiveDay] = useState<AttendanceDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);
  const [fullAttendanceData, setFullAttendanceData] = useState<AttendanceDay[]>(
    []
  );
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999);
        const today = new Date().getDay();
        const oneYearAgo = new Date();
        oneYearAgo.setDate(currentDate.getDate() - (365 + today));
        oneYearAgo.setHours(0, 0, 0, 0);

        console.log(currentDate, oneYearAgo);

        const response = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/attendance/${studentId}?startDate=${oneYearAgo.toISOString()}&endDate=${currentDate.toISOString()}`
        );
        if (
          response.status === 200 &&
          Array.isArray(response.data.attendanceData)
        ) {
          setAttendanceData(response.data.attendanceData);
        } else {
          setAttendanceData([]);
          console.warn("Invalid attendance data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setAttendanceData([]);
      }
    };

    fetchAttendanceData();
  }, [studentId]);

  const generateFullYearAttendance = () => {
    const fullYearAttendance: AttendanceDay[] = [];

    const currentDate = new Date();
    const today = new Date().getDay();
    const oneYearAgo = new Date();
    if (currentDate.getFullYear() % 4 == 0) {
      oneYearAgo.setDate(currentDate.getDate() - (365 - 1 + today));
    } else {
      oneYearAgo.setDate(currentDate.getDate() - (365 + today));
    }

    for (
      let d = new Date(oneYearAgo);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const attendanceRecord =
        Array.isArray(attendanceData) &&
        attendanceData.find(
          (day) => new Date(day.date).toDateString() === d.toDateString()
        );

      fullYearAttendance.push({
        date: d.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        attendance: attendanceRecord ? attendanceRecord.attendance : 0,
      });
    }
    return fullYearAttendance;
  };

  useEffect(() => {
    console.log("Attendance data fetched:", attendanceData);
  }, [attendanceData]);

  useEffect(() => {
    const fullAttendanceData = generateFullYearAttendance();
    setFullAttendanceData(fullAttendanceData);
  }, [attendanceData, generateFullYearAttendance]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        setTooltipPosition({
          x: e.clientX - rect.left + 15,
          y: e.clientY - rect.top + 15,
        });
      }
    };

    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (grid) {
        grid.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="flex gap-1">
      <div className="text-xs flex flex-col items-end">
        <p className="mt-9">Mon</p>
        <p className="mt-[18px]">Wed</p>
        <p className="mt-[18px]">Fri</p>
      </div>
      <div>
        <div className="flex text-sm ">
          <div className="ml-[16px]">Dec</div>
          <div className="ml-[36px]">Jan</div>
          <div className="ml-[40px]">Feb</div>
          <div className="ml-[38px]">Mar</div>
          <div className="ml-[55px]">Apr</div>
          <div className="ml-[38px]">May</div>
          <div className="ml-[34px]">Jun</div>
          <div className="ml-[55px]">Jul</div>
          <div className="ml-[45px]">Aug</div>
          <div className="ml-[52px]">Sep</div>
          <div className="ml-[40px]">Oct</div>
          <div className="ml-[36px]">Nov</div>
        </div>
        <div
          ref={gridRef}
          className="attendance-grid w-full overflow-x-auto h-32 text-sm"
          onMouseLeave={() => setActiveDay(null)}
        >
          {fullAttendanceData.map((day, index) => (
            <div
              key={index}
              className={`grid-cell ${
                day.attendance === 0 ? "border" : ""
              } border-gray-300`}
              style={{ backgroundColor: getColor(day.attendance) }}
              onMouseEnter={() => setActiveDay(day)}
              aria-label={`Date: ${day.date}, Attendance: ${
                day.attendance === 2
                  ? "Present"
                  : day.attendance === 1
                  ? "Late"
                  : "Absent"
              }`}
            />
          ))}
          {activeDay && (
            <SmoothTooltip
              content={`${new Date(activeDay.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              })}`}
              attendance={
                activeDay.attendance === 2
                  ? "Present"
                  : activeDay.attendance === 1
                  ? "Late"
                  : "Absent"
              }
              position={tooltipPosition}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceGrid;
