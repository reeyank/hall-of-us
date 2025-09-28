"use client";
import { useState } from "react";
import useCedarChat from "@/hooks/useCedarChat";

export default function ChatPopup({ filters }) {
  const { messages, sendMessage, loading } = useCedarChat();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input, filters);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 w-80 h-96 bg-white shadow-lg rounded-lg flex flex-col">
          <div className="flex-1 overflow-y-auto p-2">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <span className="block mb-2">{m.text}</span>
              </div>
            ))}
            {loading && <div className="text-gray-500">Thinking...</div>}
          </div>

          <div className="p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 border rounded px-2"
              placeholder="Type a message..."
            />
            <button onClick={handleSend} className="bg-blue-600 text-white px-3 rounded">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
