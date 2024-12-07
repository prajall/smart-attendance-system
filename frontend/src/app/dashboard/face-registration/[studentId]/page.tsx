import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import VideoStreamHandler from "@/websocket/VideoStream";

export default function FaceRegistrationPage({
  params,
  searchParams,
}: {
  params: { studentId: string };
  searchParams: {
    name: string;
    idNumber: string;
    batch: string;
    course: string;
  };
}) {
  return (
    <Card className="p-4 w-fit mx-auto">
      <div className="text-center">
        <h1 className="">
          Face Registration for{" "}
          <span className="font-semibold">{searchParams.name} </span>
          <span className="text-muted-foreground text-sm">
            ({searchParams.idNumber})
          </span>
        </h1>
      </div>

      <div className="w-full rounded-lg overflow-hidden mt-2">
        <VideoStreamHandler mode="register" studentId={params.studentId} />
      </div>
    </Card>
  );
}
