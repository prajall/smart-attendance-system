"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");
const SocketTest = () => {
  const [input, setInput] = useState("");
  const [messages, setMessage] = useState<string[]>([]);

  useEffect(() => {
    socket.on("message", (msg) => {
      console.log("Message Received: ", msg);
      setMessage((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const submitInput = () => {
    if (input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a message"
      />
      <button onClick={submitInput}>Submit</button>
      {messages.map((message: string, index: number) => (
        <p key={message + index}>{message}</p>
      ))}
    </div>
  );
};

export default SocketTest;
