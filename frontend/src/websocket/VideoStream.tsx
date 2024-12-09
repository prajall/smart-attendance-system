"use client";

import LottieAnimation from "@/components/LottieAnimation";
import { Info } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";

// Initialize the socket outside the component
const socket = io("http://localhost:5000");

const VideoStreamHandler = ({
  mode,
  studentId,
}: {
  mode: "register" | "check";
  studentId?: string;
}) => {
  const [sendFrames, setSendFrames] = useState(false);
  const [message, setMessage] = useState<String>("");
  const [showFaceIcon, setShowFaceIcon] = useState(false);
  const [reg_1, setReg_1] = useState({
    message: "",
    success: true,
  });
  const [reg_2, setReg_2] = useState({
    message: "",
    success: true,
  });
  const [reg_3, setReg_3] = useState({
    message: "",
    success: true,
  });
  const [check_1, setCheck_1] = useState({
    message: "",
  });
  const [check_2, setCheck_2] = useState({
    message: "",
    success: true,
  });
  const [check_3, setCheck_3] = useState({
    message: "",
    success: false,
  });

  const animationRef = useRef<{
    handleStep2: () => void;
    handleStep3: () => void;
    handleReverse2: () => void;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("WebSocket connection established");
    });

    socket.on("disconnect", () => {
      console.log("WebSocket connection closed");
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    socket.on("reg_1", (msg) => {
      console.log(msg);
      setReg_1({ ...reg_1, message: msg.message });
      setReg_3({
        ...reg_3,
        message: "Registering face embeddings",
        success: true,
      });
    });

    socket.on("reg_2", (msg) => {
      console.log(msg);
      setReg_2({ ...reg_2, message: msg.message });
    });

    socket.on("reg_3", (msg) => {
      console.log(msg);
      setReg_3({ ...reg_3, message: msg.message, success: msg.success });
    });

    socket.on("check_1", (msg) => {
      console.log(msg);
      setCheck_1({ ...check_1, message: msg.message });
      setTimeout(() => {
        setCheck_1({ ...check_1, message: "" });
      }, 1500);
    });

    socket.on("check_2", (msg) => {
      console.log("Check2", msg);
      setCheck_2({ ...check_2, message: msg.message, success: msg.success });
      setTimeout(() => {
        setCheck_2({ ...check_2, message: "" });
      }, 1500);
    });

    socket.on("check_3", (msg) => {
      console.log(msg);
      setCheck_3({ ...check_3, message: msg.message, success: msg.success });
    });

    socket.on("step2", () => {
      console.log("Step 2 triggered via socket");
      animationRef.current?.handleStep2();
    });

    socket.on("step3", () => {
      console.log("Step 3 triggered via socket");
      animationRef.current?.handleStep3();
      setTimeout(() => {
        setSendFrames(false);
        setShowFaceIcon(false);
      }, 1000);
    });

    socket.on("reverse2", () => {
      console.log("Reverse 2 triggered via socket");
      animationRef.current?.handleReverse2();
    });

    // socket.on("stop", () => {
    //   setSendFrames(false);
    //   setShowFaceIcon(false);
    // });

    // Message received
    const handleMessage = (msg: string) => {
      console.log("Message Received: ", msg);
      setMessage(msg);

      // Reset the timeout for clearing the message
      //@ts-ignore
      if (window.messageTimeout) {
        //@ts-ignore
        clearTimeout(window.messageTimeout);
      }

      // Clear the message after 3 seconds
      //@ts-ignore
      window.messageTimeout = setTimeout(() => {
        setMessage("");
      }, 3000);
    };

    socket.on("message", handleMessage);

    return () => {
      // Clean up socket listeners
      socket.off("connect");
      socket.off("disconnect");
      socket.off("error");
      socket.off("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startCamera();
  }, []);

  const captureFrame = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        const frame = canvas.toDataURL("image/jpeg");

        if (socket.connected) {
          socket.emit(mode === "check" ? "face-check" : "register-frame", {
            frame,
          });
        } else {
          console.warn("Socket is not connected");
        }
      }
    }
  };

  useEffect(() => {
    if (!sendFrames) return;
    let interval: NodeJS.Timeout;
    if (mode === "check") {
      interval = setInterval(() => {
        captureFrame();
      }, 700);
    } else {
      interval = setInterval(() => {
        captureFrame();
      }, 400);
    }

    return () => {
      clearInterval(interval);
    };
  }, [sendFrames]);

  return (
    <div className="relative w-fit mx-auto">
      {message && (
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          className=" text-center z-10 "
        >
          <p
            style={{
              backgroundColor: "#1CBB9B",
              color: "white",
              opacity: 0.6,
              width: "24rem",
              padding: "0.5rem 1rem",
            }}
            className=" w-96 py-1 flex gap-2 justify-center items-center rounded-md"
          >
            {message}
          </p>
        </div>
      )}
      <div className=" relative w-full h-full flex justify-center items-center">
        {check_2?.message && (
          <AnimatePresence>
            <motion.p
              className="text-center py-2 rounded-md z-10"
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "10px 50px",
                color: check_2?.success ? "white" : "#ef4444",
                backgroundColor: check_2?.success ? "#1cbb9ba4" : "#ef4444a4",
              }}
            >
              {check_2.message}
            </motion.p>
          </AnimatePresence>
        )}
        {check_3?.message && (
          <AnimatePresence>
            <motion.p
              className="text-center py- rounded-md z-10"
              style={{
                position: "absolute",
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "5px 20px",
                color: "white",
                backgroundColor: check_3?.success ? "#1cbb9ba4" : "#ef4444a4",
              }}
            >
              {check_3.message}
            </motion.p>
          </AnimatePresence>
        )}
        {reg_3?.message && (
          <AnimatePresence>
            <motion.p
              className="text-center py- rounded-md z-10"
              style={{
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "5px 20px",
                color: "white",
                backgroundColor: reg_3?.success ? "#1cbb9ba4" : "#ef4444a4",
              }}
            >
              {reg_3.message}
            </motion.p>
          </AnimatePresence>
        )}
        <AnimatePresence>
          {showFaceIcon && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: -60 }}
              animate={{ opacity: 1, y: 0, x: -60 }}
              exit={{ opacity: 0, y: -20, x: -60 }}
              transition={{ type: "spring", duration: 0.7, ease: "easeIn" }}
              className="absolute z-10"
              style={{
                backgroundColor: "rgba(255,255,255,0.4)",
                backdropFilter: "blur(5px)",
                borderRadius: "40px",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <LottieAnimation ref={animationRef} />
            </motion.div>
          )}
        </AnimatePresence>

        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-auto transform rounded-md -scale-x-100"
          style={{ transform: "scaleX(-1)", maxWidth: "700px" }}
        ></video>
      </div>
      <canvas
        ref={canvasRef}
        width="1000"
        height="750"
        style={{ display: "none" }}
      ></canvas>

      <p className="text-center flex gap-1 items-center text-sm text-muted-foreground mt-1">
        <Info size={16} />
        Please look directly at the camera while slowly moving your head to
        capture your face.
      </p>
      <button
        className="w-full bg-blue text-white py-2 mt-2 rounded-md"
        onClick={() => {
          setSendFrames(!sendFrames);
          if (mode === "check") {
            setShowFaceIcon(!showFaceIcon);
          }
          if (sendFrames) {
            if (mode === "register") {
              socket.emit("register-stop");
            } else {
              socket.emit("face-check-stop");
            }
          } else {
            if (mode === "register") {
              socket.emit("register-start", { studentId });
            } else {
              socket.emit("face-check-start");
            }
          }
        }}
      >
        {" "}
        {sendFrames
          ? "Stop " + (mode === "register" ? "Registering" : "Checking")
          : "Start " + (mode === "register" ? "Registering" : "Checking")}
      </button>
      <p className="mt-2 text-center">{reg_1.message}</p>
      <p>{check_1.message}</p>
    </div>
  );
};

export default VideoStreamHandler;
