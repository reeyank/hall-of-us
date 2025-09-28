import { useState } from "react";

export default function useCedarChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(text, filters = {}) {
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, filters }),
      });

      const data = await res.json();

    if (data.error) {
      setMessages((prev) => [...prev, { role: "system", text: `⚠️ ${data.error}` }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: "user", text },
        { role: "bot", text: data.reply },
      ]);
    }

    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  }

  return { messages, sendMessage, loading };
}
