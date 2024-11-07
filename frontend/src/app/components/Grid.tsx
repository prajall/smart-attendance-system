"use client";

import React, { useState, useRef, useEffect } from "react";

interface AttendanceDay {
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

const AttendanceGrid: React.FC = () => {
  const [activeDay, setActiveDay] = useState<AttendanceDay | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const attendanceData: AttendanceDay[] = [
    {
      date: "2024-11-04",
      attendance: 1,
    },
    {
      date: "2023-11-09",
      attendance: 1,
    },
    {
      date: "2023-11-07",
      attendance: 1,
    },
    {
      date: "2023-11-08",
      attendance: 1,
    },
    {
      date: "2023-11-14",
      attendance: 2,
    },
    {
      date: "2024-01-14",
      attendance: 2,
    },
    {
      date: "2024-01-15",
      attendance: 2,
    },
    {
      date: "2024-01-16",
      attendance: 1,
    },
    {
      date: "2024-01-19",
      attendance: 1,
    },
    {
      date: "2024-01-18",
      attendance: 2,
    },
    {
      date: "2024-01-02",
      attendance: 2,
    },
    {
      date: "2024-01-03",
      attendance: 2,
    },
    {
      date: "2024-01-04",
      attendance: 2,
    },
    {
      date: "2024-01-07",
      attendance: 2,
    },
    {
      date: "2024-01-08",
      attendance: 2,
    },
    {
      date: "2024-01-09",
      attendance: 2,
    },
    {
      date: "2024-01-11",
      attendance: 2,
    },
    {
      date: "2024-01-12",
      attendance: 1,
    },
    {
      date: "2024-01-22",
      attendance: 1,
    },
    {
      date: "2024-01-23",
      attendance: 1,
    },
    {
      date: "2024-01-26",
      attendance: 2,
    },
    {
      date: "2024-01-27",
      attendance: 2,
    },
  ];

  const generateFullYearAttendance = () => {
    const fullYearAttendance: AttendanceDay[] = [];
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    oneYearAgo.setDate(oneYearAgo.getDate() + 1);

    for (
      let d = new Date(oneYearAgo);
      d <= currentDate;
      d.setDate(d.getDate() + 1)
    ) {
      const attendanceRecord = attendanceData.find(
        (day) => new Date(day.date).toDateString() === d.toDateString()
      );

      fullYearAttendance.push({
        date: d.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        attendance: attendanceRecord ? attendanceRecord.attendance : 0,
      });
    }
    return fullYearAttendance;
  };

  const fullAttendanceData = generateFullYearAttendance();

  const startDay = new Date(attendanceData[0].date).getDay();
  const emptyCells = startDay + 1;

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
    <div
      ref={gridRef}
      className="attendance-grid w-full overflow-x-auto h-32 text-sm"
      onMouseLeave={() => setActiveDay(null)}
    >
      {Array.from({ length: emptyCells }).map((_, index) => (
        <div key={`empty-${index}`} className="attendance-cell empty"></div>
      ))}

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
  );
};

export default AttendanceGrid;
