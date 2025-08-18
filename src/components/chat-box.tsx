"use client";
import  { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatApiResponse = {
  response: string;
};

const ChatBox: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: input }),
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("API error");
      const data: ChatApiResponse = await res.json();
      setMessages((msgs) => [...msgs, { role: "assistant", content: data.response }]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong!");
      }
    } finally {
      setInput("");
      setLoading(false);
    }
  }

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <div className="mb-4 h-64 overflow-y-auto nf-scrollbar border p-2 bg-gray-50 rounded">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className="font-bold">{m.role === "user" ? "You" : "AI"}:</span> {m.content}
          </div>
        ))}
        {loading && <div>Assistant is typing…</div>}
        <div ref={bottomRef} />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Type your message…"
          disabled={loading}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
