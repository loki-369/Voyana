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

export default function AIAssistant({ trip, onUpdateTrip }: AIAssistantProps) {
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
      color: "text-sky-500 bg-sky-50 border-sky-100",
    },
    {
      label: "Local Food Tips",
      icon: Utensils,
      prompt: trip ? `What local dishes should I try in ${trip.destination}?` : "Tell me what traditional food to eat in Kashmir",
      color: "text-emerald-500 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Translate Phrases",
      icon: Languages,
      prompt: "Translate common shopping and directions phrases to local language",
      color: "text-purple-500 bg-purple-50 border-purple-100",
    },
    {
      label: "Scams to Avoid",
      icon: AlertTriangle,
      prompt: trip ? `What tourist scams should I avoid in ${trip.destination}?` : "What tourist scams should I be aware of in Kashmir?",
      color: "text-amber-500 bg-amber-50 border-amber-100",
    },
  ];

  // Render markdown-like text to simple HTML elements
  const renderMessageContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      // Headers (e.g. ### Header or **Header**)
      if (line.startsWith("### ")) {
        return (
          <h4 key={index} className="text-sm font-bold text-slate-800 mt-3 mb-1.5 flex items-center gap-1.5">
            {line.substring(4)}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={index} className="text-base font-bold text-slate-900 mt-4 mb-2">
            {line.substring(3)}
          </h3>
        );
      }

      // Bold replacements
      let formattedLine: React.ReactNode = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (line.match(boldRegex)) {
        const parts = line.split(boldRegex);
        formattedLine = parts.map((part, i) => (i % 2 === 1 ? <strong key={i} className="font-semibold text-slate-900">{part}</strong> : part));
      }

      // Bullet points
      if (line.startsWith("* ") || line.startsWith("- ")) {
        return (
          <li key={index} className="ml-4 list-disc text-xs text-slate-600 mb-1 leading-relaxed">
            {formattedLine.toString().replace(/^[\*\-]\s+/, "")}
          </li>
        );
      }

      // Empty line
      if (line.trim() === "") {
        return <div key={index} className="h-2" />;
      }

      // Normal paragraph
      return (
        <p key={index} className="text-xs text-slate-600 leading-relaxed mb-1.5">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full max-h-[85vh]">
      {/* Sidebar Quick Actions */}
      <div className="lg:col-span-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-sky-500" />
            AI Travel Assistant
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Voyana AI accompanies you throughout your journey. Select an action below or chat directly.
          </p>

          <div className="space-y-2.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSendMessage(action.prompt)}
                disabled={loading}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all hover:scale-[1.01] hover:shadow-sm ${action.color} disabled:opacity-50`}
              >
                <action.icon className="w-4 h-4 shrink-0" />
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-6 text-[10px] text-slate-400 leading-relaxed">
          💡 **Note:** AI results are contextualized for J&K. Works offline with predefined templates if network is disabled.
        </div>
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 max-h-[60vh]">
          {messages.map((msg, index) => {
            const isBot = msg.role === "assistant";
            return (
              <div key={index} className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}>
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <Bot className="w-4.5 h-4.5 text-sky-600" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-4 rounded-2xl border text-xs shadow-2xs ${
                    isBot
                      ? "bg-slate-50 border-slate-100 rounded-tl-xs text-slate-700"
                      : "bg-sky-600 border-sky-700 text-white rounded-tr-xs"
                  }`}
                >
                  {isBot ? renderMessageContent(msg.content) : msg.content}
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5 text-sky-600 animate-bounce" />
              </div>
              <div className="bg-slate-50 border border-slate-100 max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
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
          className="flex gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={trip ? `Ask about your trip to ${trip.destination}...` : "Ask anything about local sights, language, scams..."}
            className="flex-1 text-sm bg-transparent border-none outline-none px-2 text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
