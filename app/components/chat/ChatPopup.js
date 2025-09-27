"use client";
import React, { useState } from "react";

export default function ChatPopup({ open, onClose, memoryPreview }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((m) => [...m, { from: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // Replace this fetch with your backend Cedar integration
      const res = await fetch("/api/cedar-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, memoryId: memoryPreview?.id }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { from: "assistant", text: "Error: could not get response" }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md mx-auto
                      bg-gradient-to-br from-purple-800 via-indigo-800 to-blue-800
                      text-white rounded-t-xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/30">
          <div className="font-semibold text-lg">Cedar Chat</div>
          <button onClick={onClose} className="text-white font-bold text-xl leading-none">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {messages.map((m, i) => (
            <div key={i} className={`${m.from === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block px-3 py-1 rounded-lg max-w-[80%] break-words
                ${m.from === "user" ? "bg-white/25 text-white" : "bg-white/30 text-white"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-white/70">Typing...</div>}
        </div>

        {/* Input */}
        <div className="flex px-4 py-3 gap-2 border-t border-white/30 bg-white/10 backdrop-blur-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask assistant to tag or enhance"
            className="flex-1 rounded px-3 py-2 bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          <button
            onClick={send}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-4 py-2 font-semibold transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
