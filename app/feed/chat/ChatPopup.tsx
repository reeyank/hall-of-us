"use client";
import React, { useState } from "react";

export default function ChatPopup({ open, onClose, memoryPreview }: { open: boolean; onClose: () => void; memoryPreview?: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "assistant"; text: string }[]>([]);

  const send = async () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { from: "user", text: input }]);
    const text = input;
    setInput("");
    await new Promise((r) => setTimeout(r, 700));
    setMessages((m) => [...m, { from: "assistant", text: `Simulated assistant reply to: "${text}"` }]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center pointer-events-none">
      <div className="w-full max-w-xl pointer-events-auto bg-white rounded-t-lg shadow-lg p-3">
        <div className="flex items-center gap-3">
          {memoryPreview && <img src={memoryPreview} alt="mem" className="w-12 h-12 object-cover rounded" />}
          <div className="flex-1 text-sm text-gray-700">Chat (placeholder)</div>
          <button className="text-gray-600" onClick={onClose}>Close</button>
        </div>
        <div className="mt-3 max-h-48 overflow-auto border rounded p-2 bg-gray-50">
          {messages.map((m, i) => (
            <div key={i} className={`mb-2 ${m.from === "user" ? "text-right" : "text-left"}`}>
              <div className={`${m.from === "user" ? "inline-block bg-blue-600 text-white px-3 py-1 rounded" : "inline-block bg-white px-3 py-1 rounded border"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border px-2 py-1 rounded" placeholder="Ask assistant to tag or enhance" />
          <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}
