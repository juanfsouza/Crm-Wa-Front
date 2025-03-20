import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Tipo para as mensagens
interface Message {
  participants: never[];
  from: string;
  content: string;
  name: string;
  profilePic: string | null;
}

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
  query: {
    token: "YOUR_AUTH_TOKEN",
  },
});

export const useWebSocket = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Função para enviar mensagens via WebSocket
  const sendMessage = (data: { to: string; message: string }) => {
    socket.emit("sendMessage", data);
  };

  useEffect(() => {
    socket.on("newMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  return { sendMessage, messages };
};
