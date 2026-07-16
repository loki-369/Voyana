"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertTriangle, Languages, Utensils, CalendarDays } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  trip?: any;
  onUpdateTrip?: (updatedTrip: any) => void;
}

export default function AIAssistant({ trip }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am **Voyana**, your AI Travel Companion. 

I can help you build custom itineraries, translate regional phrases, recommend authentic local food, or guide you away from tourist scams. 

What can I assist you with today?`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          destination: trip?.destination || "",
          budget: trip?.budget ? `₹${trip.budget}` : "",
          days: 5,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Sorry, I ran into an error processing your query. Please try again." },
        ]);
      }
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Network connection failed. Please ensure you are online to chat." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: "Plan Itinerary",
      icon: CalendarDays,
      prompt: trip ? `Plan a day-by-day itinerary for my trip to ${trip.destination}` : "Suggest a 5-day adventure itinerary for Kashmir",
    },
    {
      label: "Local Food Tips",
      icon: Utensils,
      prompt: trip ? `What local dishes should I try in ${trip.destination}?` : "Tell me what traditional food to eat in Kashmir",
    },
    {
      label: "Translate Phrases",
      icon: Languages,
      prompt: "Translate common shopping and directions phrases to local language",
    },
    {
      label: "Scams to Avoid",
      icon: AlertTriangle,
      prompt: trip ? `What tourist scams should I avoid in ${trip.destination}?` : "What tourist scams should I be aware of in Kashmir?",
    },
  ];

  // Render markdown-like text to simple HTML elements
  const renderMessageContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-xs font-bold text-neutral-800 mt-4 mb-2 flex items-center gap-1.5 border-b border-neutral-100 pb-1">
            {line.substring(4)}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-xs uppercase tracking-wider font-bold text-neutral-850 mt-5 mb-2.5">
            {line.substring(3)}
          </h3>
        );
      }

      let formattedLine: React.ReactNode = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (line.match(boldRegex)) {
        const parts = line.split(boldRegex);
        formattedLine = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-neutral-900 bg-amber-50 px-1 rounded">{part}</strong> : part));
      }

      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc text-xs text-neutral-600 mb-1 leading-relaxed font-light">
            {formattedLine.toString().replace(/^[\*\-]\s+/, "")}
          </li>
        );
      }

      if (line.trim() === "") {
        return <div key={index} className="h-2.5" />;
      }

      return (
        <p key={index} className="text-xs text-neutral-600 leading-relaxed mb-1.5 font-light">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[85vh] font-sans pb-6">
      {/* Sidebar Quick Actions */}
      <div className="lg:col-span-1 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col justify-between h-full shadow-sm">
        <div>
          <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-450 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#0f766e]" />
            Assistant Rules
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-light">
            Voyana AI accompanies you throughout your journey. Select a preset query or write your own.
          </p>

          <div className="space-y-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSendMessage(action.prompt)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-neutral-200/60 text-left text-xs font-semibold bg-[#faf9f6]/40 text-neutral-700 hover:border-neutral-950 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <action.icon className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#faf9f6] p-3 rounded-lg border border-neutral-200/50 text-[9px] text-neutral-450 leading-relaxed font-light">
          💡 **Note:** Custom regional phrases are optimized for Kashmir and operate offline using cached templates.
        </div>
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-3 bg-white p-6 border border-neutral-200/50 rounded-xl flex flex-col h-full overflow-hidden shadow-sm">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 max-h-[60vh]">
          {messages.map((msg, index) => {
            const isBot = msg.role === "assistant";
            return (
              <div key={index} className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}>
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-800 shadow-sm">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-4 rounded-2xl border text-xs shadow-sm ${
                    isBot
                      ? "bg-[#faf9f6]/60 border-neutral-200/60 text-neutral-750"
                      : "bg-neutral-950 border-neutral-950 text-white rounded-br-none"
                  }`}
                >
                  {isBot ? renderMessageContent(msg.content) : msg.content}
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-4 h-4 text-neutral-600" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-lg bg-neutral-950 flex items-center justify-center shrink-0 border border-neutral-800">
                <Bot className="w-4 h-4 text-emerald-400 animate-bounce" />
              </div>
              <div className="bg-[#faf9f6]/60 border border-neutral-200/60 max-w-[80%] px-4 py-3 rounded-2xl flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex gap-2 bg-[#faf9f6] p-2 rounded-xl border border-neutral-200/60 shadow-inner"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={trip ? `Ask about your trip to ${trip.destination}...` : "Ask about local spots, safety precautions, or routes..."}
            className="flex-1 text-xs bg-transparent border-none outline-none px-3 text-neutral-800 font-light"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2.5 bg-neutral-950 hover:bg-neutral-850 text-white rounded-lg transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
