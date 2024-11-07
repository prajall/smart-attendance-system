import AttendanceGrid from "@/app/components/Grid";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentDetails } from "../../../../../types/types";

export default function Component({
  student,
}: { student?: StudentDetails } = {}) {
  // Default student details for example
  const defaultStudent: StudentDetails = {
    name: "John Doe",
    idNumber: "STU12345",
    email: "john.doe@example.com",
    address: "123 College St, Anytown, AT 12345",
    dateOfBirth: "1999-05-15",
    course: "Computer Science",
    batch: "2022",
    section: "A",
    contactNo: "+1 (555) 123-4567",
    guardianName: "Jane Doe",
    guardianContact: "+1 (555) 987-6543",
    photoUrl:
      "https://t3.ftcdn.net/jpg/03/39/60/22/360_F_339602256_dBq6bYfHWzlnRQkXgAMFXZfx2r1DPQns.jpg",
  };

  const studentData = student || defaultStudent;

  return (
    <>
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-shrink-0">
              <Avatar className="w-44 h-44 my-auto">
                <AvatarImage
                  src={studentData.photoUrl}
                  alt={studentData.name}
                  className="object-cover"
                />
                <AvatarFallback>
                  {studentData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Name</h3>
                <p>{studentData.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">ID Number</h3>
                <p>{studentData.idNumber}</p>
              </div>
              <div className="sm:col-span-2">
                <h3 className="font-semibold">Address</h3>
                <p>{studentData.address}</p>
              </div>
              <div>
                <h3 className="font-semibold">Date of Birth</h3>
                <p>{studentData.dateOfBirth}</p>
              </div>
              <div>
                <h3 className="font-semibold">Course</h3>
                <p>{studentData.course}</p>
              </div>
              <div>
                <h3 className="font-semibold">Batch</h3>
                <p>{studentData.batch}</p>
              </div>
              <div>
                <h3 className="font-semibold">Section</h3>
                <p>{studentData.section}</p>
              </div>
              <div>
                <h3 className="font-semibold">Contact No.</h3>
                <p>{studentData.contactNo}</p>
              </div>
              <div>
                <h3 className="font-semibold">Guardian's Name</h3>
                <p>{studentData.guardianName}</p>
              </div>
              <div>
                <h3 className="font-semibold">Guardian's Contact</h3>
                <p>{studentData.guardianContact}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4 absolute">
        <CardHeader>
          <CardTitle>Attendance Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceGrid />
        </CardContent>
      </Card>
    </>
  );
}
