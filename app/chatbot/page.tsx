"use client";

import { useState } from "react";

export default function ChatbotPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    console.log("📤 Sending message:", input);

    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const userMsg = input;
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      console.log("📥 Raw API Response:", res);

      const data = await res.json();
      console.log("🔍 Parsed Response:", data);

      if (data.error) {
        console.error("🚨 API Error:", data.error);
        alert("AI Error: " + data.error);
        setMessages((prev) => [...prev, { sender: "bot", text: "❌ Error: " + data.error }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      }
    } catch (err: any) {
      console.error("🔥 Chatbot Crash:", err);
      alert("Chatbot crashed: " + err.message);
      setMessages((prev) => [...prev, { sender: "bot", text: "❌ Crash: " + err.message }]);
    }

    setLoading(false);
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI Chatbot (Debug Mode)</h1>

      <div className="border rounded p-3 h-[400px] overflow-y-auto bg-white shadow">
        {messages.map((m, idx) => (
          <p key={idx} className={m.sender === "user" ? "text-blue-600" : "text-green-600"}>
            <b>{m.sender}:</b> {m.text}
          </p>
        ))}
        {loading && <p className="text-gray-500">⏳ Thinking...</p>}
      </div>

      <div className="flex gap-2 mt-4">
        <input
          className="border p-2 flex-1 rounded"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
