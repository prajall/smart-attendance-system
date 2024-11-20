"use client";
import React, { useEffect, useRef, useState } from "react";

const VideoStream = ({ onFrame }: { onFrame: (frame: Blob) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          const captureFrame = () => {
            if (videoRef.current) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              context.drawImage(
                videoRef.current,
                0,
                0,
                canvas.width,
                canvas.height
              );
              canvas.toBlob((blob) => {
                if (blob) onFrame(blob);
              }, "image/jpeg");
            }
            requestAnimationFrame(captureFrame);
          };
          captureFrame();
        }
      } catch (err) {
        console.error("Error accessing the camera:", err);
      }
    };

    startVideoStream();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [onFrame]);

  return <video ref={videoRef} style={{ width: "100%", height: "auto" }} />;
};

const VideoStreamHandler = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://your-backend-server-url");
    ws.onopen = () => console.log("WebSocket connected");
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (error) => console.error("WebSocket error:", error);
    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const handleFrame = (frame: Blob) => {
    if (socket?.readyState === WebSocket.OPEN) {
      frame.arrayBuffer().then((buffer) => {
        socket.send(buffer);
      });
    }
  };

  return (
    <div className="w-full h-full">
      <VideoStream onFrame={handleFrame} />
    </div>
  );
};

export default VideoStreamHandler;
