import { useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";

export const ChatComponent = () => {
  const [message, setMessage] = useState<string>("");
  const { sendMessage, messages } = useWebSocket();

  const handleSendMessage = () => {
    sendMessage({ to: "1234567890@c.us", message });
    setMessage(""); // Limpa o campo de mensagem após o envio
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow p-4 space-y-4 bg-gray-100 overflow-y-scroll">
        <ul>
          {messages.map((msg, index) => (
            <li key={index} className="p-2 bg-white rounded-md shadow-md max-w-sm">
              {/* Exibindo a foto de perfil e o nome do remetente */}
              <div className="flex items-center space-x-2">
                {msg.profilePic ? (
                  <img src={msg.profilePic} alt={msg.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full" />
                )}
                <h3 className="text-sm font-semibold">{msg.name || msg.from}</h3>
              </div>
              <p>{msg.content}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex p-4 bg-gray-800">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow p-2 bg-white rounded-l-md"
          placeholder="Digite uma mensagem..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-r-md"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};
