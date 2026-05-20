"use client";

import * as React from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  MessageCircle,
  Send,
  Sparkles,
  X,
  Loader2,
  RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";

type CourseRecommendation = {
  _id?: string;
  title?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
};

type ChatMessage = {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  recommendations?: CourseRecommendation[];
};

const QUICK_PROMPTS = [
  "I want to learn React",
  "Best backend course?",
  "Affordable courses",
  "Beginner friendly courses",
];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AIChatbot() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Hi! I'm **LearnBot**. Tell me what you'd like to learn and I'll recommend the best courses for you.",
      timestamp: Date.now(),
    },
  ]);

  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/ai/suggest`,
        { message: content },
        { withCredentials: true }
      );

      const reply =
        res.data?.reply ||
        "Sorry, I couldn't come up with a recommendation right now.";
      const recommendations: CourseRecommendation[] =
        res.data?.recommendations || [];

      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
        recommendations,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      const fallback =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        "Something went wrong. Please try again in a moment.";
      const aiMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: fallback,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function resetChat() {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content:
          "Fresh start! What would you like to learn today?",
        timestamp: Date.now(),
      },
    ]);
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        aria-label={open ? "Close chatbot" : "Open chatbot"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white",
          "shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl",
          "focus:outline-none focus:ring-4 focus:ring-purple-400/40",
          open && "rotate-90"
        )}
      >
        {open ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
      </button>

      {/* Chat window */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out",
          "right-3 bottom-24 sm:right-5 sm:bottom-24",
          "w-[calc(100vw-1.5rem)] sm:w-[400px]",
          "h-[75vh] sm:h-[600px] max-h-[85vh]",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div
          className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-2xl",
            "border border-white/10 bg-zinc-950/95 backdrop-blur-xl",
            "shadow-2xl shadow-black/40"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 shadow-inner">
                <Bot className="size-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zinc-950 bg-green-500" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">LearnBot</p>
                <p className="text-[11px] text-zinc-400">
                  AI Course Assistant • Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                title="New chat"
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <RefreshCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Minimize"
                className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {loading && <TypingIndicator />}
          </div>

          {/* Quick prompts (only when conversation is fresh) */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 pb-2 pt-1">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-zinc-500">
                <Sparkles className="size-3" /> Try asking
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition-all hover:border-purple-400/50 hover:bg-purple-500/10 hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 bg-zinc-950/80 p-3">
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-zinc-900/80 p-2 focus-within:border-purple-400/40 focus-within:ring-2 focus-within:ring-purple-500/20 transition">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask LearnBot about courses…"
                className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                disabled={loading}
              />
              <Button
                type="button"
                size="icon"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className={cn(
                  "size-9 shrink-0 rounded-lg",
                  "bg-gradient-to-br from-indigo-500 to-pink-500 text-white hover:opacity-90",
                  "disabled:opacity-40"
                )}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-zinc-500">
              Press Enter to send • Shift + Enter for a new line
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
          <Bot className="size-4" />
        </div>
      )}

      <div
        className={cn(
          "flex max-w-[85%] flex-col gap-1.5",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-sm bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-900/30"
              : "rounded-bl-sm border border-white/10 bg-zinc-900/80 text-zinc-100"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div
              className={cn(
                "prose prose-invert prose-sm max-w-none",
                "prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5",
                "prose-strong:text-white prose-code:text-pink-300"
              )}
            >
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Course recommendation cards */}
        {!isUser &&
          message.recommendations &&
          message.recommendations.length > 0 && (
            <div className="flex w-full flex-col gap-2 pt-1">
              {message.recommendations.map((c, i) => (
                <CourseCard key={c._id || i} course={c} />
              ))}
            </div>
          )}

        <span className="px-1 text-[10px] text-zinc-500">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: CourseRecommendation }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 transition-all hover:border-purple-400/40 hover:bg-white/10">
      {course.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.image}
          alt={course.title || "Course"}
          className="size-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/30 to-pink-500/30">
          <Sparkles className="size-5 text-purple-300" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="truncate text-sm font-semibold text-white">
          {course.title || "Untitled course"}
        </p>
        {course.description && (
          <p className="line-clamp-1 text-xs text-zinc-400">
            {course.description}
          </p>
        )}
        <p className="mt-0.5 text-xs font-medium text-purple-300">
          {typeof course.price === "number" ? `₹${course.price}` : "Free"}
        </p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white">
        <Bot className="size-4" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-zinc-900/80 px-3.5 py-3">
        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-zinc-400" />
      </div>
    </div>
  );
}
