"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoStreamHandler from "../../websocket/VideoStream";

const VideoPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="">
        <CardHeader>
          <CardTitle className="text-center">Start Attendance</CardTitle>
        </CardHeader>
        <CardContent className=" relative flex flex-col items-center">
          <p className="text-center text-gray-600 mb-4 text-sm">
            We are capturing your face to mark your attendance. Please look
            directly at the camera.
          </p>

          <div className="relative w-[700px]">
            <VideoStreamHandler mode="check" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoPage;
