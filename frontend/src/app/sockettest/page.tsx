"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");
const SocketTest = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<String[]>([]);

  useEffect(() => {
    socket.on("message", (msg) => {
      console.log("Message Received: ", msg);
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
      {messages.map((message) => (
        <p>{message}</p>
      ))}
    </div>
  );
};

export default SocketTest;
