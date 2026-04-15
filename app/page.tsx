"use client";

import { useState, useEffect } from "react";
import { Send, Search, Info, CheckCircle2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: number;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<string>("checking...");

  useEffect(() => {
    fetch("/health")
      .then((res) => res.json())
      .then((data) => setHealthStatus(data.status))
      .catch(() => setHealthStatus("error"));
  }, []);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.answer,
        sources: data.sources_found,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error connecting to backend demo server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen flex flex-col">
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Search className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">AutoResearch AI <span className="text-blue-600 font-mono text-sm border border-blue-600 px-1.5 rounded uppercase">Demo</span></h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className={`w-4 h-4 ${healthStatus === "ok" ? "text-green-500" : "text-red-500"}`} />
          <span>Backend: {healthStatus}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto mb-6 space-y-4 pr-2">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <Info className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Ask anything about the system...</p>
            <p className="text-sm">Example: "What is AutoResearch AI?"</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.sources !== undefined && (
                <div className="mt-2 text-xs opacity-60 border-t border-black/10 dark:border-white/10 pt-2">
                  Sources found: {msg.sources}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-2xl rounded-tl-none animate-pulse text-gray-400">
              Searching dataset...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="relative group">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2.5 rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      
      <footer className="mt-8 text-center text-xs text-gray-400 py-4">
        Minimal Deployment Version • CPU Only • Fast Startup
      </footer>
    </main>
  );
}
